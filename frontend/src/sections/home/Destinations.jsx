import { Container } from '../../components/layout/Container';
import { destinations } from '../../data/homepageData';

export const Destinations = () => {
  return (
    <section id="destinations" className="py-20 scroll-mt-20 bg-bg-base border-t border-border-subtle overflow-hidden flex flex-col items-center">
      <Container className="mb-10 text-center">
        <h2 className="text-lg font-medium text-text-secondary uppercase tracking-widest">
          Explore Selected Destinations
        </h2>
      </Container>

      {/* Marquee Container */}
      <div
        className="w-full relative flex group overflow-hidden"
        style={{ width: '100vw', maxWidth: '100%' }}
      >
        {/* Left/Right Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-bg-base to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-bg-base to-transparent z-10 pointer-events-none" />

        {/* Moving Track */}
        <div className="marquee-track items-center">
          {/* First Set */}
          <div className="flex gap-8 md:gap-16 px-4 md:px-8 items-center">
            {destinations.map((dest, i) => (
              <div key={`dest-1-${i}`} className="flex items-center gap-3 flex-none whitespace-nowrap">
                <span className={`w-3 h-3 rounded-full flex-none ${dest.color}`} aria-hidden="true" />
                <span className="text-3xl md:text-5xl font-editorial font-medium text-text-primary opacity-80 hover:opacity-100 transition-opacity cursor-default">
                  {dest.shortName ? (
                    <>
                      <span aria-hidden="true">{dest.shortName}</span>
                      <span className="sr-only">{dest.name}</span>
                    </>
                  ) : (
                    dest.name
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Duplicated Set for infinite loop (hidden from screen readers) */}
          <div className="flex gap-8 md:gap-16 px-4 md:px-8 items-center" aria-hidden="true">
            {destinations.map((dest, i) => (
              <div key={`dest-2-${i}`} className="flex items-center gap-3 flex-none whitespace-nowrap">
                <span className={`w-3 h-3 rounded-full flex-none ${dest.color}`} />
                <span className="text-3xl md:text-5xl font-editorial font-medium text-text-primary opacity-80 hover:opacity-100 transition-opacity cursor-default">
                  {dest.shortName || dest.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
