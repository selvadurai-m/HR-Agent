'use client';

import { useState } from 'react';
import { ArrowLeft, Coins, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useUser } from '@/app/provider';

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 10,
    price: 29,
    pricePerCredit: 2.9,
    popular: false,
    features: [
      '10 Interview Credits',
      'Perfect for small teams',
      'Valid for 6 months',
      'Email support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 25,
    price: 59,
    pricePerCredit: 2.36,
    popular: true,
    features: [
      '25 Interview Credits',
      'Best value for money',
      'Valid for 12 months',
      'Priority email support',
      'Bulk interview creation',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 50,
    price: 99,
    pricePerCredit: 1.98,
    popular: false,
    features: [
      '50 Interview Credits',
      'Best price per credit',
      'Valid for 12 months',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
  },
];

export default function Billing() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]); // Default to professional
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, updateUserCredits } = useUser();

  const handlePurchase = async () => {
    setLoading(true);

    try {
      // Update user credits
      const currentCredits = user?.credits || 0;
      const newCredits = currentCredits + selectedPackage.credits;

      const result = await updateUserCredits(newCredits);

      if (result.success) {
        toast.success(
          `Successfully purchased ${selectedPackage.credits} credits! You now have ${newCredits} credits.`
        );

        setTimeout(() => {
          router.push('/recruiter/dashboard');
        }, 2000);
      } else {
        toast.error('Failed to update credits. Please try again.');
        console.error('Credit update error:', result.error);
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Current Balance */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Purchase Credits
              </h1>
              <p className="text-gray-500 text-sm">
                Buy credits to create AI-powered interviews
              </p>
            </div>
          </div>
        </div>

        {/* Current Balance - Compact Badge */}
        {user && (
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 rounded-2xl px-5 py-3 shadow-lg shadow-violet-500/20 flex items-center gap-4 sm:ml-auto">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 relative">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div className="relative">
              <p className="text-white/70 text-xs font-medium">
                Current Balance
              </p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold text-white">
                  {user.credits || 0}
                </p>
                <p className="text-white/60 text-xs">credits</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Credit Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative cursor-pointer transition-all hover:shadow-xl rounded-2xl border-2 ${
              selectedPackage.id === pkg.id
                ? 'ring-2 ring-violet-500 border-violet-500 shadow-lg shadow-violet-500/20'
                : 'border-gray-100 hover:border-violet-200'
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-4 pt-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div
                  className={`p-2 rounded-xl ${pkg.popular ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gray-100'}`}
                >
                  <Coins
                    className={`w-5 h-5 ${pkg.popular ? 'text-white' : 'text-violet-600'}`}
                  />
                </div>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                ${pkg.price}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                ${pkg.pricePerCredit.toFixed(2)} per credit
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="p-0.5 bg-emerald-100 rounded-full">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-violet-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-violet-600 mb-1">
                  {pkg.credits}
                </div>
                <div className="text-sm text-violet-600/70 font-medium">
                  Interview Credits
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Section */}
      <Card className="max-w-lg mx-auto rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 rounded-t-2xl">
          <CardTitle className="text-center text-gray-800">
            Complete Purchase
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">
                Selected Package
              </span>
              <span className="text-violet-600 font-semibold">
                {selectedPackage.name}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">Credits</span>
              <span className="text-violet-600 font-semibold">
                {selectedPackage.credits} credits
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-violet-600 font-bold text-xl">
                ${selectedPackage.price}
              </span>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20 py-6 text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                `Purchase ${selectedPackage.credits} Credits`
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Credits are valid for 12 months from purchase date
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          How Credits Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group text-center p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/20">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">
              1 Credit = 1 Interview
            </h3>
            <p className="text-sm text-gray-500">
              Each interview creation costs exactly 1 credit
            </p>
          </div>
          <div className="group text-center p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
              <Check className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">
              Unlimited Candidates
            </h3>
            <p className="text-sm text-gray-500">
              One interview link can be shared with unlimited candidates
            </p>
          </div>
          <div className="group text-center p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-lg">12</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">
              12 Month Validity
            </h3>
            <p className="text-sm text-gray-500">
              Credits are valid for 12 months from purchase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
