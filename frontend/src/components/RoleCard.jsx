import PropTypes from 'prop-types';

/**
 * RoleCard Component
 *
 * Displays a placeholder card for each platform role:
 * Patient, Doctor, Clinic, Blood Donor.
 *
 * Props:
 *   icon        — emoji or SVG icon
 *   title       — role name
 *   description — short description of the role
 *   gradient    — CSS gradient string for the icon background
 *   features    — array of upcoming features for this role
 *   delay       — animation delay class (for staggered entrance)
 */
function RoleCard({ icon, title, description, gradient, features, delay }) {
  return (
    <div
      className={`card-hover glass rounded-2xl p-6 flex flex-col gap-4 cursor-default
                  opacity-0-init animate-slide-up ${delay}`}
      role="article"
      aria-label={`${title} role card`}
    >
      {/* Icon with gradient background */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0"
        style={{ background: gradient }}
      >
        {icon}
      </div>

      {/* Card content */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>

        {/* Feature list */}
        <ul className="flex flex-col gap-1.5 mt-1">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Coming soon badge */}
      <div className="mt-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-400
                         bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1 h-1 rounded-full bg-brand-400 animate-pulse" />
          Coming in Feature 2
        </span>
      </div>
    </div>
  );
}

RoleCard.propTypes = {
  icon:        PropTypes.string.isRequired,
  title:       PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  gradient:    PropTypes.string.isRequired,
  features:    PropTypes.arrayOf(PropTypes.string).isRequired,
  delay:       PropTypes.string,
};

RoleCard.defaultProps = {
  delay: '',
};

export default RoleCard;
