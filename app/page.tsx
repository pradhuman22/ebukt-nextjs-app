import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h2 className="text-accent-foreground">Homepage</h2>
      <Button className={"font-bold"}>
        <Link href={"/"}> Go Back</Link>
      </Button>
    </div>
  );
}
