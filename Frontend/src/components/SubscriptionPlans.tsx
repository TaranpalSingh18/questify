import React from 'react';
import { Check, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
}

const SubscriptionPlans: React.FC<{ showInModal?: boolean }> = ({ showInModal = false }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const plans: Plan[] = [
    {
      name: 'Free',
      price: '₹0/month',
      features: [
        { text: 'Access to basic quests', included: true },
        { text: 'Basic profile visibility', included: true },
        { text: 'Standard quest response time', included: true },
        { text: 'Basic leaderboard participation', included: true },
        { text: 'Limited quest submissions per month', included: true },
        { text: 'Early access to new quests', included: false },
        { text: 'Priority profile visibility to hirers', included: false },
        { text: 'Premium quest categories', included: false },
      ],
      buttonText: 'Current Plan',
    },
    {
      name: 'Premium',
      price: '₹499/month',
      features: [
        { text: 'Access to basic quests', included: true },
        { text: 'Basic profile visibility', included: true },
        { text: 'Standard quest response time', included: true },
        { text: 'Basic leaderboard participation', included: true },
        { text: 'Unlimited quest submissions', included: true },
        { text: '24-hour early access to new quests', included: true },
        { text: 'Priority profile visibility to hirers', included: true },
        { text: 'Premium quest categories', included: true },
      ],
      buttonText: 'Upgrade to Premium',
      popular: true,
    },
  ];

  const handleUpgrade = () => {
    // TODO: Implement payment integration
    console.log('Upgrade to premium clicked');
  };

  return (
    <div className={`py-6 ${showInModal ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-base text-gray-600">
          Unlock premium features to enhance your quest experience
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
              plan.popular ? 'border-2 border-blue-500' : 'border border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg">
                <Star className="h-4 w-4 inline-block mr-1" />
                Popular
              </div>
            )}

            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-3">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check
                      className={`h-5 w-5 mr-3 ${
                        feature.included ? 'text-green-500' : 'text-gray-300'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        feature.included ? 'text-gray-900' : 'text-gray-400 line-through'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpgrade}
                className={`w-full py-2 px-3 rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                disabled={!plan.popular}
              >
                {plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans; 