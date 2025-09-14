import { Link } from "@heroui/link";
import { Navbar as HeroUINavbar, NavbarBrand, NavbarContent } from "@heroui/navbar";

import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link className="flex items-center gap-2" color="foreground" href="/">
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="basis-full" justify="end">
        <ThemeSwitch />
      </NavbarContent>
    </HeroUINavbar>
  );
};
