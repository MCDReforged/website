import { SimpleEverything } from "@/catalogue/simple-types";
import { ControlCard } from "./sidebar-control";
import { StatsCard } from "./sidebar-stats";

export async function Sidebar({everything}: { everything: SimpleEverything }) {
  return (
    <div className="mx-[8px] flex flex-col gap-5">
      <ControlCard everything={everything} />
      <StatsCard everything={everything} />
    </div>
  )
}
