import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function cleanMarkdownNoise(text) {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  return text
    // Remove heading markers (##, ###, ####, etc.) at line start.
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    // Remove paired emphasis markers like **text**, ***text***, ****text****.
    .replace(/\*{2,4}([^*]+?)\*{2,4}/g, "$1")
    // Remove any remaining runs of 2-4 asterisks.
    .replace(/\*{2,4}/g, "")
    // Normalize trailing spaces before line break.
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function countNoiseTokens(text) {
  if (typeof text !== "string" || text.length === 0) {
    return 0;
  }

  const headingMatches = text.match(/^\s{0,3}#{1,6}\s*/gm) ?? [];
  const emphasisMatches = text.match(/\*{2,4}/g) ?? [];
  return headingMatches.length + emphasisMatches.length;
}

async function run() {
  const { data: modules, error } = await supabase
    .from("modules")
    .select("id,title,objective,description,content")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error loading modules:", error.message);
    process.exit(1);
  }

  if (!modules || modules.length === 0) {
    console.log("No modules found.");
    return;
  }

  let updatedCount = 0;
  let unchangedCount = 0;

  for (const moduleRow of modules) {
    const cleanedTitle = cleanMarkdownNoise(moduleRow.title);
    const cleanedObjective = cleanMarkdownNoise(moduleRow.objective);
    const cleanedDescription = cleanMarkdownNoise(moduleRow.description);
    const cleanedContent = cleanMarkdownNoise(moduleRow.content);

    const noiseBefore =
      countNoiseTokens(moduleRow.title) +
      countNoiseTokens(moduleRow.objective) +
      countNoiseTokens(moduleRow.description) +
      countNoiseTokens(moduleRow.content);

    const isChanged =
      cleanedTitle !== moduleRow.title ||
      cleanedObjective !== moduleRow.objective ||
      cleanedDescription !== moduleRow.description ||
      cleanedContent !== moduleRow.content;

    if (!isChanged) {
      unchangedCount++;
      console.log(`- Module ${moduleRow.id}: no changes needed`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("modules")
      .update({
        title: cleanedTitle,
        objective: cleanedObjective,
        description: cleanedDescription,
        content: cleanedContent,
      })
      .eq("id", moduleRow.id);

    if (updateError) {
      console.error(`x Module ${moduleRow.id}: update failed - ${updateError.message}`);
      continue;
    }

    updatedCount++;
    console.log(`+ Module ${moduleRow.id}: cleaned (${noiseBefore} markdown tokens removed)`);
  }

  console.log("\nDone.");
  console.log(`Updated modules: ${updatedCount}`);
  console.log(`Unchanged modules: ${unchangedCount}`);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
