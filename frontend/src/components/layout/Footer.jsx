import { Container } from './Container';
import studyrouteLogoLight from '../../assets/brand/studyroute-logo-light.png';
import { footerLinks } from '../../data/homepageData';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-landing-accent via-dest-1 to-dest-2 pt-16 pb-8 text-white font-bold">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <img
              src={studyrouteLogoLight}
              alt="StudyRoute"
              className="w-[140px] h-auto mb-6 object-contain"
            />
            <p className="text-[15px] font-normal leading-relaxed mb-6 text-white/90">
              Personalized university discovery and study-abroad guidance.
            </p>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h4 className="text-white text-[16px] font-bold mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-[14px] lg:text-[15px] font-normal leading-[1.8] text-white/90 hover:text-white transition-opacity outline-none-focus rounded"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] lg:text-[14px] font-normal text-white/70">
          <p>&copy; {new Date().getFullYear()} StudyRoute. All rights reserved.</p>
          <p className="text-center md:text-right">
            University information should be verified through official sources.
          </p>
        </div>
      </Container>
    </footer>
  );
};
