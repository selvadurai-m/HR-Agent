'use client';

/**
 * Floating particles animation component - CSS-only version for better performance
 * Used for decorative background effects on auth pages
 * @param {Object} props
 * @param {number} [props.count=15] - Number of particles to render (reduced for performance)
 * @param {string} [props.color='violet'] - Base color for particles (violet, blue)
 */
export function FloatingParticles({ count = 15, color = 'violet' }) {
  // Reduce particle count for better performance
  const particleCount = Math.min(count, 15);

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 3,
  }));

  const colorClasses = {
    violet: 'bg-violet-500/20',
    blue: 'bg-blue-500/20',
  };

  const bgClass = colorClasses[color] || colorClasses.violet;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${bgClass}`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `floatParticle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatParticle {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-15px);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

export default FloatingParticles;
