export function stringSRTToVTT(srtContent: string): string {
  // Convert SRT format to WebVTT format
  let vttContent = "WEBVTT\n\n";

  // Replace comma with dot in timestamps (SRT uses , for milliseconds, VTT uses .)
  const lines = srtContent.split("\n");
  let skipNextNumber = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip sequence numbers (numeric lines that come before timestamps)
    if (/^\d+$/.test(line)) {
      skipNextNumber = true;
      continue;
    }

    // Process timestamp lines
    if (line.includes("-->")) {
      const convertedLine = line.replace(/,/g, ".");
      vttContent += convertedLine + "\n";
      skipNextNumber = false;
    } else if (line.length > 0) {
      // Add subtitle text
      vttContent += line + "\n";
    } else if (!skipNextNumber) {
      // Add blank line separator
      vttContent += "\n";
    }
  }

  return vttContent;
}

export async function srtToVtt(file: File): Promise<File> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async (event) => {
      try {
        const srtContent = event.target?.result as string;
        const vttContent = stringSRTToVTT(srtContent);

        // Create a VTT file from the converted content
        const vttBlob = new Blob([vttContent], { type: "text/vtt" });
        const vttFile = new File(
          [vttBlob],
          file.name.replace(/\.srt$/i, ".vtt"),
          { type: "text/vtt" },
        );

        resolve(vttFile);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read SRT file"));
    };

    reader.readAsText(file);
  });
}
