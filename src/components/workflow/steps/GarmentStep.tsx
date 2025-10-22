import { GarmentType } from '@/types/garment';
import { useWorkflow } from '@/contexts/WorkflowContext';

export function GarmentStep({ value, onChange }: { value: GarmentType; onChange: (v: GarmentType) => void }) {
  const { update, next } = useWorkflow();
  const handleChange = (v: GarmentType) => {
    onChange(v);
    // sync to workflow selection so validation can pass
    const mapped = v === 't-shirt' ? 'tshirt' : v;
    update({ garmentType: mapped as any });
    // Remove auto-advance - let user manually proceed
  };

  const garmentOptions = [
    {
      id: 'shirt' as GarmentType,
      label: 'Shirt',
      icon: '👔',
      description: 'Business & casual shirts',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      id: 't-shirt' as GarmentType,
      label: 'T-Shirt',
      icon: '👕',
      description: 'Casual & everyday wear',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      id: 'pant' as GarmentType,
      label: 'Pant',
      icon: '👖',
      description: 'Trousers & formal pants',
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-1">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Choose your garment
          </h2>
        </div>

        {/* Garment Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {garmentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleChange(option.id)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                value === option.id
                  ? `border-transparent bg-gradient-to-br ${option.bgGradient} shadow-lg scale-105`
                  : 'border-border bg-card/50 hover:bg-card/80 shadow-sm'
              }`}
            >
              {/* Selection Indicator */}
              {value === option.id && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                value === option.id
                  ? `bg-gradient-to-br ${option.gradient} shadow-lg`
                  : 'bg-muted/50 group-hover:bg-muted'
              }`}>
                {value === option.id ? (
                  <span className="text-white">{option.icon}</span>
                ) : (
                  <span className="opacity-70 group-hover:opacity-100">{option.icon}</span>
                )}
              </div>

              {/* Label */}
              <h3 className={`text-lg font-semibold mb-1 transition-colors ${
                value === option.id
                  ? 'text-foreground'
                  : 'text-foreground/80 group-hover:text-foreground'
              }`}>
                {option.label}
              </h3>

              {/* Description */}
              <p className={`text-xs transition-colors ${
                value === option.id
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/80'
              }`}>
                {option.description}
              </p>

              {/* Active Border Animation */}
              {value === option.id && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 -z-10 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Helper Text */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro tip:</strong> Select the type of garment you want to tailor. You can change this later in the process.
          </p>
        </div>
      </div>
    </div>
  );
}
