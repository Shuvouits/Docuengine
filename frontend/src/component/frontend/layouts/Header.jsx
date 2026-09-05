import DesktopNavbar from "./DesktopNavbar";
import MobileMenu from "./MobileMenu";

function Header() {
    return (
        <header className="relative z-50 w-full">
            <DesktopNavbar />
            <MobileMenu />
        </header>
    );
}

export default Header;