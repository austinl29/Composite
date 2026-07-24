import { getTechniques } from "@/lib/techniques";
import TechniqueBrowser from "./TechniqueBrowser";

export const dynamic = "force-dynamic";

export default async function Home() {
  const techniques = await getTechniques();
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <TechniqueBrowser techniques={techniques} />
    </div>
  );
}
