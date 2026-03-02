import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIGMA_API = "https://api.figma.com/v1";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const FIGMA_API_KEY = Deno.env.get("FIGMA_API_KEY");
    if (!FIGMA_API_KEY) {
      return new Response(
        JSON.stringify({ error: "FIGMA_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { fileKey, nodeIds } = await req.json();

    if (!fileKey) {
      return new Response(
        JSON.stringify({ error: "fileKey is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const figmaHeaders = {
      "X-Figma-Token": FIGMA_API_KEY,
    };

    // Fetch file data
    let fileUrl = `${FIGMA_API}/files/${fileKey}`;
    if (nodeIds) {
      fileUrl += `?ids=${encodeURIComponent(nodeIds)}`;
    }

    const [fileResp, stylesResp] = await Promise.all([
      fetch(fileUrl, { headers: figmaHeaders }),
      fetch(`${FIGMA_API}/files/${fileKey}/styles`, { headers: figmaHeaders }),
    ]);

    if (!fileResp.ok) {
      const errText = await fileResp.text();
      console.error("Figma file API error:", fileResp.status, errText);
      
      let userMessage = `Figma API error: ${fileResp.status}`;
      if (fileResp.status === 403) {
        userMessage = "Brak dostępu do pliku Figma. Sprawdź czy: (1) Twój klucz API Figma jest aktualny, (2) plik jest udostępniony Twojemu kontu Figma, (3) link do pliku jest poprawny.";
      } else if (fileResp.status === 404) {
        userMessage = "Nie znaleziono pliku Figma. Sprawdź czy link jest poprawny.";
      }
      
      return new Response(
        JSON.stringify({ error: userMessage }),
        { status: fileResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileData = await fileResp.json();
    const stylesData = stylesResp.ok ? await stylesResp.json() : { meta: { styles: [] } };

    // Collect top-level frame IDs for image export
    const topFrames: { id: string; name: string }[] = [];
    const pages = fileData.document?.children || [];
    for (const page of pages) {
      if (page.children) {
        for (const frame of page.children) {
          if (frame.type === "FRAME" || frame.type === "COMPONENT" || frame.type === "COMPONENT_SET") {
            topFrames.push({ id: frame.id, name: frame.name });
          }
        }
      }
    }

    // Fetch thumbnail images for up to 10 frames
    let frameImages: { id: string; name: string; imageUrl: string }[] = [];
    const framesToFetch = topFrames.slice(0, 10);
    if (framesToFetch.length > 0) {
      const ids = framesToFetch.map((f) => f.id).join(",");
      try {
        const imgResp = await fetch(
          `${FIGMA_API}/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=0.5`,
          { headers: figmaHeaders }
        );
        if (imgResp.ok) {
          const imgData = await imgResp.json();
          if (imgData.images) {
            frameImages = framesToFetch
              .filter((f) => imgData.images[f.id])
              .map((f) => ({
                id: f.id,
                name: f.name,
                imageUrl: imgData.images[f.id],
              }));
          }
        }
      } catch (e) {
        console.error("Error fetching frame images:", e);
      }
    }

    // Extract key design information
    const result = {
      name: fileData.name,
      lastModified: fileData.lastModified,
      version: fileData.version,
      document: extractNodes(fileData.document),
      styles: stylesData.meta?.styles || [],
      colors: extractColors(fileData.document),
      typography: extractTypography(fileData.document),
      components: extractComponents(fileData.document),
      frameImages,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("figma-fetch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Extract node tree (simplified)
function extractNodes(node: any, depth = 0): any {
  if (depth > 4) return { name: node.name, type: node.type, truncated: true };

  const result: any = {
    name: node.name,
    type: node.type,
  };

  if (node.absoluteBoundingBox) {
    result.bounds = node.absoluteBoundingBox;
  }

  if (node.fills?.length) {
    result.fills = node.fills.filter((f: any) => f.type === "SOLID").map((f: any) => ({
      color: f.color,
      opacity: f.opacity,
    }));
  }

  if (node.style) {
    result.textStyle = {
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      lineHeight: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
    };
  }

  if (node.characters) {
    result.text = node.characters.slice(0, 200);
  }

  if (node.cornerRadius) {
    result.cornerRadius = node.cornerRadius;
  }

  if (node.effects?.length) {
    result.effects = node.effects;
  }

  if (node.children?.length) {
    result.children = node.children.slice(0, 30).map((c: any) => extractNodes(c, depth + 1));
  }

  return result;
}

// Extract unique colors
function extractColors(node: any, colors = new Set<string>()): string[] {
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === "SOLID" && fill.color) {
        const { r, g, b } = fill.color;
        const hex = `#${Math.round(r * 255).toString(16).padStart(2, "0")}${Math.round(g * 255).toString(16).padStart(2, "0")}${Math.round(b * 255).toString(16).padStart(2, "0")}`;
        colors.add(hex);
      }
    }
  }
  if (node.children) {
    for (const child of node.children) {
      extractColors(child, colors);
    }
  }
  return [...colors];
}

// Extract typography styles
function extractTypography(node: any, fonts = new Map<string, any>()): any[] {
  if (node.style?.fontFamily) {
    const key = `${node.style.fontFamily}-${node.style.fontSize}-${node.style.fontWeight}`;
    if (!fonts.has(key)) {
      fonts.set(key, {
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        lineHeight: node.style.lineHeightPx,
      });
    }
  }
  if (node.children) {
    for (const child of node.children) {
      extractTypography(child, fonts);
    }
  }
  return [...fonts.values()];
}

// Extract components
function extractComponents(node: any, comps: any[] = []): any[] {
  if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
    comps.push({
      name: node.name,
      type: node.type,
      description: node.description || "",
      bounds: node.absoluteBoundingBox,
    });
  }
  if (node.children) {
    for (const child of node.children) {
      extractComponents(child, comps);
    }
  }
  return comps;
}
