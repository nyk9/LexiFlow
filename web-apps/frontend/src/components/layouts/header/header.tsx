import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { UserNav } from "@/components/auth/user-nav";

const Header = () => {
  return (
    <header className="flex justify-between items-center border p-4">
      <nav className="flex gap-4">
        <Link href={"/"} className="p-1 hover:underline">
          home
        </Link>
        <Link href={"/add"} className="p-1 hover:underline">
          add
        </Link>
        <Link href={"/record"} className="p-1 hover:underline">
          record
        </Link>
        <Link href={"/quiz"} className="p-1 hover:underline">
          quiz
        </Link>
        <Link href={"/test"} className="p-1 hover:underline">
          test
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <UserNav />
        <ModeToggle />
      </div>
    </header>
  );
};
export default Header;
