import { Container } from './Container';
import studyrouteLogoLight from '../../assets/brand/studyroute-logo-light.png';
import { footerLinks } from '../../data/homepageData';

export const Footer = () => {
  return (
    <footer className="bg-bg-surface border-t border-border-subtle pt-16 pb-8 text-text-secondary">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <img
              src={studyrouteLogoLight}
              alt="StudyRoute"
              className="w-[140px] h-auto mb-6 object-contain"
            />
            <p className="text-sm leading-relaxed mb-6">
              AI-assisted university discovery and admission-guidance platform.
            </p>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h4 className="text-text-primary font-medium mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-landing-accent transition-colors outline-none-focus rounded"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} StudyRoute. All rights reserved.</p>
          <p className="text-center md:text-right text-text-secondary/80">
            University information should be verified through official sources.
          </p>
        </div>
      </Container>
    </footer>
  );
};
