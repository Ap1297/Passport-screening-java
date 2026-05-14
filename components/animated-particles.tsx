import React from 'react';

// Pre-generated particles data to ensure consistency across renders
const PARTICLES_DATA = Array.from({ length: 30 }, (_, i) => {
  // Use deterministic random based on index for consistency
  const seed = (i * 9301 + 49297) % 233280;
  const random1 = (seed / 233280);
  const random2 = ((seed * 211 + 53) % 233280) / 233280;
  const random3 = ((seed * 307 + 97) % 233280) / 233280;
  const random4 = ((seed * 409 + 151) % 233280) / 233280;
  const random5 = ((seed * 503 + 199) % 233280) / 233280;
  const random6 = ((seed * 601 + 251) % 233280) / 233280;

  return {
    id: i,
    width: 2 + random1 * 4,
    height: 2 + random2 * 4,
    left: random3 * 100,
    top: random4 * 100,
    opacity: 0.2 + random5 * 0.4,
    duration: 10 + random1 * 20,
    delay: random6 * 10,
  };
});

export const AnimatedParticles: React.FC = () => {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES_DATA.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="absolute rounded-full"
            style={{
              width: `${particle.width.toFixed(2)}px`,
              height: `${particle.height.toFixed(2)}px`,
              left: `${particle.left.toFixed(2)}%`,
              top: `${particle.top.toFixed(2)}%`,
              background: `rgba(251, 191, 36, ${particle.opacity.toFixed(2)})`,
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.3)',
              animation: `floatParticle ${particle.duration.toFixed(2)}s ease-in-out infinite`,
              animationDelay: `${particle.delay.toFixed(2)}s`,
              willChange: 'transform',
            } as React.CSSProperties}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-40px) translateX(20px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) translateX(-10px);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-60px) translateX(10px);
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
};
