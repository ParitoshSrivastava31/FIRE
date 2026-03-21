"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, User } from "lucide-react";

const OCCUPATIONS = [
  { id: "salaried", label: "Salaried", icon: "💼", desc: "Regular monthly income" },
  { id: "freelancer", label: "Freelancer / Gig", icon: "💻", desc: "Variable income" },
  { id: "business", label: "Business Owner", icon: "🏪", desc: "Running my own business" },
  { id: "student", label: "Student", icon: "🎓", desc: "Building the habit early" },
];

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Lucknow", "Jaipur", "Kanpur", "Nagpur", "Indore", "Bhopal",
  "Surat", "Agra", "Varanasi", "Patna", "Kochi", "Coimbatore", "Chandigarh",
  "Bhubaneswar", "Visakhapatnam", "Noida", "Gurgaon", "Ghaziabad", "Faridabad",
];

export default function OnboardingStep1() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    city: "",
    occupation: "",
  });
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const filteredCities = INDIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    setForm({ ...form, city });
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!form.fullName.trim()) {
      newErrors.fullName = "Name is required";
    } else if (form.fullName.length < 2 || !/^[a-zA-Z\s]*$/.test(form.fullName)) {
      newErrors.fullName = "Please enter a valid name (letters only)";
    }

    // DOB validation (Age 18 - 80)
    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const birthDate = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) newErrors.dob = "You must be at least 18 years old to use Monetra.";
      if (age > 100) newErrors.dob = "Please enter a valid date of birth.";
    }

    // City validation
    if (!INDIAN_CITIES.includes(form.city) && form.city.length > 0) {
      newErrors.city = "Please select a city from the dropdown.";
    } else if (!form.city) {
      newErrors.city = "City is required";
    }

    // Occupation
    if (!form.occupation) {
      newErrors.occupation = "Please select your occupation.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    // Save to sessionStorage / Zustand store
    sessionStorage.setItem("onboarding_step1", JSON.stringify(form));
    router.push("/onboarding/step-2");
  };

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <p className="text-[var(--gold)] text-xs font-bold tracking-widest uppercase mb-2">Step 1 — Personal Profile</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-main)] leading-tight">
          Tell us about yourself
        </h1>
        <p className="text-[var(--text-sec)] mt-2 text-sm leading-relaxed">
          This helps Monetra personalise your AI investment thesis and real estate recommendations.
        </p>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[var(--text-main)]">Full Name</label>
          <input
            type="text"
            placeholder="Priya Sharma"
            className={`w-full h-12 px-4 rounded-xl border bg-[var(--card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all ${errors.fullName ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
            value={form.fullName}
            onChange={(e) => {
              setForm({ ...form, fullName: e.target.value });
              if (errors.fullName) setErrors({ ...errors, fullName: "" });
            }}
          />
          {errors.fullName && <p className="text-xs text-[var(--red)]">{errors.fullName}</p>}
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[var(--text-main)]">Date of Birth</label>
          <p className="text-xs text-[var(--text-muted)]">Used for age-based financial benchmarking</p>
          <input
            type="date"
            className={`w-full h-12 px-4 rounded-xl border bg-[var(--card)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all ${errors.dob ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
            value={form.dob}
            onChange={(e) => {
              setForm({ ...form, dob: e.target.value });
              if (errors.dob) setErrors({ ...errors, dob: "" });
            }}
          />
          {errors.dob && <p className="text-xs text-[var(--red)]">{errors.dob}</p>}
        </div>

        {/* City */}
        <div className="space-y-1.5 relative">
          <label className="text-sm font-semibold text-[var(--text-main)]">City</label>
          <p className="text-xs text-[var(--text-muted)]">Used for real estate locality data</p>
          <input
            type="text"
            placeholder="Search your city..."
            className={`w-full h-12 px-4 rounded-xl border bg-[var(--card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all ${errors.city ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value);
              setForm({ ...form, city: "" });
              setShowCityDropdown(true);
              if (errors.city) setErrors({ ...errors, city: "" });
            }}
            onFocus={() => setShowCityDropdown(true)}
            onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
          />
          {errors.city && <p className="text-xs text-[var(--red)]">{errors.city}</p>}
          {showCityDropdown && citySearch && filteredCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
              {filteredCities.slice(0, 8).map((city) => (
                <button
                  key={city}
                  className="w-full text-left px-4 py-3 text-sm text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors border-b border-[var(--border)] last:border-0"
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Occupation */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text-main)]">Occupation</label>
          <p className="text-xs text-[var(--text-muted)]">Affects which investment instruments are prioritised</p>
          <div className="grid grid-cols-2 gap-3">
            {OCCUPATIONS.map((occ) => (
              <button
                key={occ.id}
                onClick={() => {
                  setForm({ ...form, occupation: occ.id });
                  if (errors.occupation) setErrors({ ...errors, occupation: "" });
                }}
                className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all ${
                  form.occupation === occ.id
                    ? "border-[var(--gold)] bg-[var(--gold-glow)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-light)]"
                }`}
              >
                <span className="text-xl">{occ.icon}</span>
                <span className="font-semibold text-sm text-[var(--text-main)]">{occ.label}</span>
                <span className="text-[11px] text-[var(--text-muted)]">{occ.desc}</span>
              </button>
            ))}
          </div>
          {errors.occupation && <p className="text-xs text-[var(--red)]">{errors.occupation}</p>}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full h-12 bg-[var(--gold)] text-white font-bold text-sm rounded-xl hover:opacity-90 hover:shadow-lg hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2"
      >
        Continue to Income & Expenses
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
