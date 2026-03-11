import { NextResponse } from "next/server";
import { requireApiUser } from "../../../lib/apiAuth";

type TeamLevel = "director" | "manager" | "assistant_manager" | "supervisor" | "lead";

type TeamMemberRow = {
  id: number;
  full_name: string;
  display_title: string;
  level: TeamLevel;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
};

const LEVEL_ORDER: TeamLevel[] = [
  "director",
  "manager",
  "assistant_manager",
  "supervisor",
  "lead",
];

function isTeamLevel(value: string | null): value is TeamLevel {
  return Boolean(value && LEVEL_ORDER.includes(value as TeamLevel));
}

export async function GET(req: Request) {
  const auth = await requireApiUser(req, [
    "trainee",
    "lead",
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const searchParams = new URL(req.url).searchParams;
  const filterParam = searchParams.get("filter");
  const filter = isTeamLevel(filterParam) ? filterParam : "all";

  const { data, error } = await auth.supabaseAdmin
    .from("team_members")
    .select("id,full_name,display_title,level,bio,photo_url,sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("full_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const members = (data ?? []) as TeamMemberRow[];
  const filteredMembers = filter === "all" ? members : members.filter((member) => member.level === filter);

  const grouped = LEVEL_ORDER.map((level) => ({
    level,
    members: members.filter((member) => member.level === level),
  }));

  return NextResponse.json({
    filter,
    members: filteredMembers,
    grouped,
  });
}
