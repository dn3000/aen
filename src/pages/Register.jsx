import { useState, useEffect, useRef } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { X } from 'lucide-react'
import { auth, db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'

// ─── Step config ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6
const STEP_LABELS = ['', 'Profile', 'Resources', 'Production', 'Markets', 'Commitment', 'Declaration']

// ─── Zimbabwe geography ───────────────────────────────────────────────────────

const PROVINCES = {
  'Bulawayo':            ['Bulawayo'],
  'Harare':              ['Epworth', 'Chitungwiza', 'Harare'],
  'Manicaland':          ['Buhera', 'Chimanimani', 'Chipinge', 'Makoni', 'Mutare', 'Mutasa', 'Nyanga'],
  'Mashonaland Central': ['Bindura', 'Guruve', 'Mazowe', 'Mbire', 'Mount Darwin', 'Muzarabani', 'Rushinga', 'Shamva'],
  'Mashonaland East':    ['Chikomba', 'Goromonzi', 'Marondera', 'Mudzi', 'Murehwa', 'Mutoko', 'Seke', 'Uzumba-Maramba-Pfungwe', 'Wedza'],
  'Mashonaland West':    ['Chegutu', 'Hurungwe', 'Kariba', 'Makonde', 'Mhondoro-Ngezi', 'Sanyati', 'Zvimba'],
  'Masvingo':            ['Bikita', 'Chiredzi', 'Chivi', 'Gutu', 'Masvingo', 'Mwenezi', 'Zaka'],
  'Matabeleland North':  ['Binga', 'Bubi', 'Hwange', 'Lupane', 'Nkayi', 'Tsholotsho', 'Umguza'],
  'Matabeleland South':  ['Beitbridge', 'Bulilima', 'Gwanda', 'Insiza', 'Mangwe', 'Matobo', 'Umzingwane'],
  'Midlands':            ['Chirumhanzu', 'Gokwe North', 'Gokwe South', 'Kwekwe', 'Mberengwa', 'Shurugwi', 'Vungu', 'Zvishavane'],
}

// ─── Zimbabwe agriculture ─────────────────────────────────────────────────────

const ZW_CROPS_GROUPED = [
  { group: 'Grains & Cereals',  items: ['Maize', 'Sorghum', 'Pearl Millet', 'Rapoko (Finger Millet)', 'Wheat', 'Rice'] },
  { group: 'Legumes',           items: ['Groundnuts', 'Soybeans', 'Sugar Beans', 'Cowpeas', 'Sunflower'] },
  { group: 'Cash Crops',        items: ['Tobacco', 'Cotton', 'Sugarcane'] },
  { group: 'Vegetables',        items: ['Tomatoes', 'Onions', 'Cabbages', 'Carrots', 'Spinach', 'Potatoes', 'Sweet Potatoes', 'Pumpkins', 'Butternuts'] },
  { group: 'Fruits',            items: ['Oranges', 'Lemons', 'Bananas', 'Avocados', 'Macadamia Nuts', 'Coffee', 'Blueberries'] },
]

const ZW_LIVESTOCK = [
  'Cattle (Beef)', 'Cattle (Dairy)', 'Goats', 'Sheep', 'Pigs',
  'Poultry (Broilers)', 'Poultry (Layers)', 'Guinea Fowl', 'Rabbits', 'Fish (Aquaculture)',
]

const ASSISTANCE_OPTIONS = ['Finance', 'Market Access', 'Inputs & Equipment', 'Training', 'Technical Support', 'Other']

const JV_TERMS = [
  'AEN provides: capital financing, inputs, market access, logistics',
  'You provide: land, labour, irrigation infrastructure, day-to-day management',
  'Profit distribution is handled according to the signed JV Agreement',
  'This agreement is governed by the laws of Zimbabwe',
  'Disputes are resolved through mediation then arbitration',
]

const firebaseErrors = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/invalid-email': 'Invalid email address.',
}

// ─── Primitive helpers ────────────────────────────────────────────────────────

function sel(hasErr) {
  return `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all`
    + ` ${hasErr ? 'border-red-400' : 'border-[var(--color-border)] hover:border-[var(--color-primary-light)]/40'}`
    + ` bg-[var(--color-surface)] text-[var(--color-text-primary)]`
}

function SaveErr({ msg }) {
  return msg
    ? <p className="text-sm rounded-xl px-4 py-3 border" style={{ color: 'var(--color-danger)', backgroundColor: 'rgba(192,57,43,0.08)', borderColor: 'rgba(192,57,43,0.2)' }} role="alert">{msg}</p>
    : null
}

function FormButtons({ submitting, onBack, submitLabel = 'Save & Continue' }) {
  return (
    <div className="flex gap-3 pt-1">
      {onBack && (
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">Back</Button>
      )}
      <Button type="submit" loading={submitting} className="flex-1">{submitLabel}</Button>
    </div>
  )
}

// ─── UI components ────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold gradient-text uppercase tracking-wide">
          Step {step} of {TOTAL_STEPS}
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {STEP_LABELS[step]}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i < step ? 'var(--gradient-gold)' : 'var(--color-border)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function YesNoToggle({ value, onChange, error }) {
  const base = 'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all'
  return (
    <div>
      <div className="flex gap-2">
        {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(val)}
            className={base}
            style={value === val
              ? { background: 'var(--gradient-gold)', color: '#1a1a1a', border: 'none' }
              : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
            }
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500" role="alert">{error}</p>}
    </div>
  )
}

function RadioGroup({ options, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <label
          key={opt}
          className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
          style={value === opt
            ? { borderColor: 'var(--color-gold)', backgroundColor: 'rgba(200,168,75,0.08)' }
            : { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }
          }
        >
          <div
            className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
            style={{ borderColor: value === opt ? 'var(--color-gold)' : 'var(--color-text-muted)' }}
          >
            {value === opt && (
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-gold)' }} />
            )}
          </div>
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{opt}</span>
          <input type="radio" className="sr-only" readOnly checked={value === opt} onChange={() => onChange(opt)} />
        </label>
      ))}
      {error && <p className="mt-1 text-xs text-red-500" role="alert">{error}</p>}
    </div>
  )
}

function TagInput({ value = [], onChange, placeholder = 'Type and press Enter to add' }) {
  const [text, setText] = useState('')
  const add = () => {
    const t = text.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setText('')
  }
  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-green-primary text-white text-xs px-3 py-1 rounded-full">
              {tag}
              <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="hover:opacity-70 leading-none">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold" />
        <button type="button" onClick={add}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors">
          Add
        </button>
      </div>
    </div>
  )
}

function CheckboxCard({ label, checked, onChange, color = 'green' }) {
  const accentColor = color === 'gold' ? 'var(--color-gold)' : 'var(--color-primary)'
  return (
    <label
      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
      style={checked
        ? { borderColor: accentColor, backgroundColor: `${accentColor}12` }
        : { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }
      }
    >
      <div
        className="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center"
        style={checked
          ? { borderColor: accentColor, backgroundColor: accentColor }
          : { borderColor: 'var(--color-text-muted)' }
        }
      >
        {checked && <span className="text-white text-xs font-bold leading-none">✓</span>}
      </div>
      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  )
}

function MultiCheckbox({ options, value = [], onChange }) {
  const toggle = opt => value.includes(opt) ? onChange(value.filter(v => v !== opt)) : onChange([...value, opt])
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => <CheckboxCard key={opt} label={opt} checked={value.includes(opt)} onChange={() => toggle(opt)} />)}
    </div>
  )
}

function GroupedMultiCheckbox({ groups, value = [], onChange }) {
  const toggle = item => value.includes(item) ? onChange(value.filter(v => v !== item)) : onChange([...value, item])
  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ group, items }) => (
        <div key={group}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {group}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {items.map(item => (
              <label
                key={item}
                onClick={() => toggle(item)}
                className="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-sm"
                style={value.includes(item)
                  ? { borderColor: 'var(--color-primary)', backgroundColor: 'rgba(41,77,45,0.08)', color: 'var(--color-primary-light)', fontWeight: 500 }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-2)' }
                }
              >
                <div
                  className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center"
                  style={value.includes(item)
                    ? { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary)' }
                    : { borderColor: 'var(--color-text-muted)' }
                  }
                >
                  {value.includes(item) && <span className="text-white text-xs leading-none font-bold">✓</span>}
                </div>
                <span className="leading-tight">{item}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      {children}
    </div>
  )
}

function Textarea({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none transition-all"
        style={{
          borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
        }}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  )
}

function SectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        {title}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
    </div>
  )
}

// ─── Step 0: Account creation ─────────────────────────────────────────────────

function AccountCreationForm({ onSuccess }) {
  const [firebaseError, setFirebaseError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  async function onSubmit({ email, password }) {
    setFirebaseError('')
    setSubmitting(true)
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(newUser)
      await setDoc(doc(db, 'farmers', newUser.uid), {
        uid: newUser.uid, profileComplete: false, createdAt: serverTimestamp(),
      }, { merge: true })
      onSuccess()
    } catch (err) {
      setFirebaseError(firebaseErrors[err.code] || 'Registration failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-6">
        <img src="/icons/aen-logohandsbrwn.svg" alt="AEN" className="h-6 w-6 object-contain" />
        <span className="font-bold text-green-primary text-lg">AEN</span>
      </div>
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] text-center mb-1">Create your account</h1>
      <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">Join thousands of Zimbabwean farmers</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email address" type="email" placeholder="farmer@example.com" error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' } })} />
        <Input label="Password" type="password" placeholder="At least 6 characters" error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })} />
        <Input label="Confirm password" type="password" placeholder="Repeat your password" error={errors.confirmPassword?.message}
          {...register('confirmPassword', { required: 'Please confirm your password', validate: v => v === password || 'Passwords do not match' })} />
        {firebaseError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2" role="alert">{firebaseError}</p>}
        <Button type="submit" loading={submitting} className="w-full mt-1">Create Account</Button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-green-primary font-medium hover:underline">Sign in</Link>
      </p>
    </>
  )
}

// ─── Step 1: Personal Details + Empowerment Profile ──────────────────────────

function Step1({ uid, savedData, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName:               savedData?.fullName               || '',
      nationalId:             savedData?.nationalId             || '',
      gender:                 savedData?.gender                 || '',
      age:                    savedData?.age                    || '',
      contact:                savedData?.contact                || '',
      familySize:             savedData?.familySize             || '',
      province:               savedData?.location?.province     || '',
      district:               savedData?.location?.district     || '',
      onMedicalAid:           savedData?.onMedicalAid           ?? null,
      onFuneralPolicy:        savedData?.onFuneralPolicy        ?? null,
      isYouthFarmer:          savedData?.empowerment?.isYouthFarmer          || false,
      isWomanFarmer:          savedData?.empowerment?.isWomanFarmer          || false,
      isPreviouslyDisadvantaged: savedData?.empowerment?.isPreviouslyDisadvantaged || false,
    },
  })

  const selectedProvince = watch('province')
  const provinceDistricts = PROVINCES[selectedProvince] || []
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    setValue('district', '')
  }, [selectedProvince, setValue])

  async function onSubmit(data) {
    setServerError('')
    setSubmitting(true)
    try {
      await Promise.all([
        setDoc(doc(db, 'farmers', uid), {
          fullName: data.fullName, nationalId: data.nationalId, gender: data.gender,
          age: Number(data.age), contact: data.contact, familySize: Number(data.familySize),
          location: { province: data.province, district: data.district },
          onMedicalAid: data.onMedicalAid, onFuneralPolicy: data.onFuneralPolicy,
        }, { merge: true }),
        setDoc(doc(db, 'farmers', uid, 'empowerment', 'empowerment'), {
          isYouthFarmer: data.isYouthFarmer,
          isWomanFarmer: data.isWomanFarmer,
          isPreviouslyDisadvantaged: data.isPreviouslyDisadvantaged,
        }, { merge: true }),
      ])
      onSuccess()
    } catch (err) {
      console.error('Step 1:', err)
      setServerError('Failed to save. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Full Name" placeholder="e.g. Tendai Moyo" error={errors.fullName?.message}
        {...register('fullName', { required: 'Full name is required' })} />
      <Input label="National ID" placeholder="e.g. 63-123456A12" error={errors.nationalId?.message}
        {...register('nationalId', { required: 'National ID is required' })} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Gender</label>
        <select className={sel(errors.gender)} {...register('gender', { required: 'Please select your gender' })}>
          <option value="">Select gender</option>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
        {errors.gender && <p className="text-xs text-red-600" role="alert">{errors.gender.message}</p>}
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Age" type="number" placeholder="e.g. 34" error={errors.age?.message}
            {...register('age', { required: 'Required', min: { value: 16, message: 'Min 16' }, max: { value: 120, message: 'Invalid age' } })} />
        </div>
        <div className="flex-1">
          <Input label="Family Size" type="number" placeholder="e.g. 5" error={errors.familySize?.message}
            {...register('familySize', { required: 'Required', min: { value: 1, message: 'Min 1' } })} />
        </div>
      </div>
      <Input label="Contact Number" type="tel" placeholder="e.g. 0771234567" error={errors.contact?.message}
        {...register('contact', { required: 'Contact number is required' })} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Province</label>
        <select className={sel(errors.province)} {...register('province', { required: 'Province is required' })}>
          <option value="">Select province</option>
          {Object.keys(PROVINCES).sort().map(p => <option key={p}>{p}</option>)}
        </select>
        {errors.province && <p className="text-xs text-red-600" role="alert">{errors.province.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>District</label>
        <select className={sel(errors.district)} disabled={!selectedProvince}
          {...register('district', { required: 'District is required' })}>
          <option value="">{selectedProvince ? 'Select district' : 'Select a province first'}</option>
          {provinceDistricts.map(d => <option key={d}>{d}</option>)}
        </select>
        {errors.district && <p className="text-xs text-red-600" role="alert">{errors.district.message}</p>}
      </div>
      <Field label="On Medical Aid?">
        <Controller name="onMedicalAid" control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
          render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <Field label="On Funeral Policy?">
        <Controller name="onFuneralPolicy" control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
          render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>

      <SectionDivider title="Empowerment Profile (optional)" />
      <div className="flex flex-col gap-2">
        {[
          { name: 'isYouthFarmer',          label: 'I am a Youth Farmer (18–35 years)' },
          { name: 'isWomanFarmer',           label: 'I am a Woman Farmer' },
          { name: 'isPreviouslyDisadvantaged', label: 'I am a Previously Disadvantaged Farmer' },
        ].map(({ name, label }) => (
          <CheckboxCard
            key={name}
            label={label}
            checked={Boolean(watch(name))}
            onChange={v => setValue(name, v, { shouldDirty: true })}
            color="gold"
          />
        ))}
      </div>

      <SaveErr msg={serverError} />
      <FormButtons submitting={submitting} />
    </form>
  )
}

// ─── Step 2: Farm Resources (Land Profile + Infrastructure) ───────────────────

function Step2({ uid, savedData, onSuccess, onBack }) {
  const fp  = savedData?.farmProfile   || {}
  const inf = savedData?.infrastructure || {}
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      landOwnership:        fp.landOwnership        || '',
      totalLandSize:        fp.totalLandSize        || '',
      landUnderProduction:  fp.landUnderProduction  || '',
      landUnderIrrigation:  fp.landUnderIrrigation  || '',
      farmingType:          fp.farmingType          || '',
      isLandInsured:        fp.isLandInsured        ?? null,
      landInsuranceDetails: fp.landInsuranceDetails || '',
      hasStorageFacilities: inf.hasStorageFacilities ?? null,
      hasFencing:           inf.hasFencing           ?? null,
      hasLivestockStructures: inf.hasLivestockStructures ?? null,
      hasWorkerHousing:     inf.hasWorkerHousing    ?? null,
    },
  })
  const isLandInsured = watch('isLandInsured')

  async function onSubmit(data) {
    setServerError('')
    setSubmitting(true)
    try {
      await Promise.all([
        setDoc(doc(db, 'farmers', uid, 'farmProfile', 'farmProfile'), {
          landOwnership:        data.landOwnership,
          totalLandSize:        Number(data.totalLandSize),
          landUnderProduction:  Number(data.landUnderProduction),
          landUnderIrrigation:  Number(data.landUnderIrrigation),
          farmingType:          data.farmingType,
          isLandInsured:        data.isLandInsured,
          landInsuranceDetails: data.isLandInsured ? data.landInsuranceDetails : '',
        }, { merge: true }),
        setDoc(doc(db, 'farmers', uid, 'infrastructure', 'infrastructure'), {
          hasStorageFacilities:  data.hasStorageFacilities,
          hasFencing:            data.hasFencing,
          hasLivestockStructures: data.hasLivestockStructures,
          hasWorkerHousing:      data.hasWorkerHousing,
        }, { merge: true }),
      ])
      onSuccess()
    } catch (err) {
      console.error('Step 2:', err)
      setServerError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const infraToggles = [
    { name: 'hasStorageFacilities',  label: 'Do you have storage facilities?' },
    { name: 'hasFencing',            label: 'Do you have fencing for livestock?' },
    { name: 'hasLivestockStructures', label: 'Do you have structures for livestock?' },
    { name: 'hasWorkerHousing',      label: 'Do you have housing for workers?' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <SectionDivider title="Land Profile" />
      <Field label="Land Ownership">
        <Controller name="landOwnership" control={control} rules={{ required: 'Please select an option' }}
          render={({ field, fieldState }) =>
            <RadioGroup options={['Own', 'Lease', 'Communal']} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Total Land (ha)" type="number" placeholder="e.g. 5" error={errors.totalLandSize?.message}
            {...register('totalLandSize', { required: 'Required', min: { value: 0.1, message: 'Invalid' } })} />
        </div>
        <div className="flex-1">
          <Input label="Under Production (ha)" type="number" placeholder="e.g. 3" error={errors.landUnderProduction?.message}
            {...register('landUnderProduction', { required: 'Required', min: { value: 0, message: 'Invalid' } })} />
        </div>
      </div>
      <Input label="Land Under Irrigation (ha)" type="number" placeholder="e.g. 2" error={errors.landUnderIrrigation?.message}
        {...register('landUnderIrrigation', { required: 'Required', min: { value: 0, message: 'Invalid' } })} />
      <Field label="Type of Farming">
        <Controller name="farmingType" control={control} rules={{ required: 'Please select an option' }}
          render={({ field, fieldState }) =>
            <RadioGroup options={['Crop Production', 'Livestock', 'Mixed Farming']} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <Field label="Is your land insured?">
        <Controller name="isLandInsured" control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
          render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      {isLandInsured === true && (
        <Input label="Please specify insurance" placeholder="Provider / policy type" error={errors.landInsuranceDetails?.message}
          {...register('landInsuranceDetails', { required: 'Please specify' })} />
      )}

      <SectionDivider title="On-Farm Infrastructure" />
      {infraToggles.map(({ name, label }) => (
        <Field key={name} label={label}>
          <Controller name={name} control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
            render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
        </Field>
      ))}

      <SaveErr msg={serverError} />
      <FormButtons submitting={submitting} onBack={onBack} />
    </form>
  )
}

// ─── Step 3: Production Capacity ──────────────────────────────────────────────

function Step3({ uid, savedData, onSuccess, onBack }) {
  const fp = savedData?.farmProfile || {}
  const farmingType   = fp.farmingType || 'Mixed Farming'
  const showCrops     = farmingType !== 'Livestock'
  const showLivestock = farmingType !== 'Crop Production'

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      mainCrops:           fp.mainCrops           || [],
      livestock:           fp.livestock           || [],
      otherProductions:    fp.otherProductions    || [],
      averageYieldOutput:  fp.averageYieldOutput  || '',
      seasonsOfExperience: fp.seasonsOfExperience || '',
      farmingMethod:       fp.farmingMethod       || '',
      waterSourceAccess:   fp.waterSourceAccess   || '',
      irrigationType:      fp.irrigationType      || '',
      laborType:           fp.laborType           || '',
      hasEquipment:        fp.hasEquipment        ?? null,
      equipmentDetails:    fp.equipmentDetails    || '',
    },
  })
  const hasEquipment = watch('hasEquipment')

  async function onSubmit(data) {
    setServerError('')
    setSubmitting(true)
    try {
      await setDoc(doc(db, 'farmers', uid, 'farmProfile', 'farmProfile'), {
        mainCrops:           data.mainCrops,
        livestock:           data.livestock,
        otherProductions:    data.otherProductions,
        averageYieldOutput:  data.averageYieldOutput,
        seasonsOfExperience: Number(data.seasonsOfExperience),
        farmingMethod:       data.farmingMethod,
        waterSourceAccess:   data.waterSourceAccess,
        irrigationType:      data.irrigationType,
        laborType:           data.laborType,
        hasEquipment:        data.hasEquipment,
        equipmentDetails:    data.hasEquipment ? data.equipmentDetails : '',
      }, { merge: true })
      onSuccess()
    } catch (err) {
      console.error('Step 3:', err)
      setServerError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {showCrops && (
        <Field label="Main Crops">
          <Controller name="mainCrops" control={control}
            rules={{ validate: v => !showCrops || v?.length > 0 || 'Select at least one crop' }}
            render={({ field, fieldState }) => (
              <>
                <GroupedMultiCheckbox groups={ZW_CROPS_GROUPED} value={field.value} onChange={field.onChange} />
                {fieldState.error && <p className="text-xs text-red-600 mt-1" role="alert">{fieldState.error.message}</p>}
              </>
            )} />
        </Field>
      )}
      {showLivestock && (
        <Field label="Livestock">
          <Controller name="livestock" control={control}
            rules={{ validate: v => !showLivestock || v?.length > 0 || 'Select at least one livestock type' }}
            render={({ field, fieldState }) => (
              <>
                <MultiCheckbox options={ZW_LIVESTOCK} value={field.value} onChange={field.onChange} />
                {fieldState.error && <p className="text-xs text-red-600 mt-1" role="alert">{fieldState.error.message}</p>}
              </>
            )} />
        </Field>
      )}
      <Field label="Other produce not listed above (optional)">
        <Controller name="otherProductions" control={control}
          render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="Type and press Enter to add" />} />
      </Field>
      <Input label="Average Yield Output per Season" placeholder="e.g. 2 tonnes of maize" error={errors.averageYieldOutput?.message}
        {...register('averageYieldOutput', { required: 'Required' })} />
      <Input label="Seasons / Years of Experience" type="number" placeholder="e.g. 5" error={errors.seasonsOfExperience?.message}
        {...register('seasonsOfExperience', { required: 'Required', min: { value: 0, message: 'Invalid' } })} />
      <Field label="Farming Method">
        <Controller name="farmingMethod" control={control} rules={{ required: 'Please select an option' }}
          render={({ field, fieldState }) =>
            <RadioGroup options={['Organic', 'Conventional (Traditional)']} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Access to Water Source</label>
        <select className={sel(errors.waterSourceAccess)} {...register('waterSourceAccess', { required: 'Required' })}>
          <option value="">Select...</option>
          {['Well', 'Dam', 'Borehole', 'River', 'None'].map(o => <option key={o}>{o}</option>)}
        </select>
        {errors.waterSourceAccess && <p className="text-xs text-red-600" role="alert">{errors.waterSourceAccess.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Irrigation Type</label>
        <select className={sel(errors.irrigationType)} {...register('irrigationType', { required: 'Required' })}>
          <option value="">Select...</option>
          {['Pivot', 'Sprinklers', 'Drip Irrigation', 'Rainpipe Irrigation', 'None'].map(o => <option key={o}>{o}</option>)}
        </select>
        {errors.irrigationType && <p className="text-xs text-red-600" role="alert">{errors.irrigationType.message}</p>}
      </div>
      <Field label="Labour Type">
        <Controller name="laborType" control={control} rules={{ required: 'Please select an option' }}
          render={({ field, fieldState }) =>
            <RadioGroup options={['Family', 'Hired', 'Both']} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <Field label="Do you have equipment?">
        <Controller name="hasEquipment" control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
          render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      {hasEquipment === true && (
        <Input label="Please specify equipment" placeholder="e.g. Tractor, irrigation pump" error={errors.equipmentDetails?.message}
          {...register('equipmentDetails', { required: 'Please specify' })} />
      )}
      <SaveErr msg={serverError} />
      <FormButtons submitting={submitting} onBack={onBack} />
    </form>
  )
}

// ─── Step 4: Market Access ────────────────────────────────────────────────────

function Step4({ uid, savedData, onSuccess, onBack }) {
  const mp = savedData?.marketProfile || {}
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      currentSellLocations:       mp.currentSellLocations       || '',
      hasExistingBuyers:          mp.hasExistingBuyers          ?? null,
      facingMarketingChallenges:  mp.facingMarketingChallenges  ?? null,
      marketingChallengesDetails: mp.marketingChallengesDetails || '',
    },
  })
  const facingChallenges = watch('facingMarketingChallenges')

  async function onSubmit(data) {
    setServerError('')
    setSubmitting(true)
    try {
      await setDoc(doc(db, 'farmers', uid, 'marketProfile', 'marketProfile'), {
        currentSellLocations:       data.currentSellLocations,
        hasExistingBuyers:          data.hasExistingBuyers,
        facingMarketingChallenges:  data.facingMarketingChallenges,
        marketingChallengesDetails: data.facingMarketingChallenges ? data.marketingChallengesDetails : '',
      }, { merge: true })
      onSuccess()
    } catch (err) {
      console.error('Step 4:', err)
      setServerError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Textarea label="Where do you currently sell your produce?" placeholder="e.g. Local market, roadside, contract buyer..."
        error={errors.currentSellLocations?.message} {...register('currentSellLocations', { required: 'Required' })} />
      <Field label="Do you have existing buyers?">
        <Controller name="hasExistingBuyers" control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
          render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <Field label="Are you facing marketing challenges?">
        <Controller name="facingMarketingChallenges" control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
          render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      {facingChallenges === true && (
        <Textarea label="Please specify challenges" placeholder="Describe the marketing challenges you face..."
          error={errors.marketingChallengesDetails?.message} {...register('marketingChallengesDetails', { required: 'Please describe the challenges' })} />
      )}
      <SaveErr msg={serverError} />
      <FormButtons submitting={submitting} onBack={onBack} />
    </form>
  )
}

// ─── Step 5: Commitment ───────────────────────────────────────────────────────

function Step5({ uid, savedData, onSuccess, onBack }) {
  const mp = savedData?.marketProfile || {}
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      farmingCommitment:    mp.farmingCommitment    || '',
      willingToFollowPlans: mp.willingToFollowPlans ?? null,
      willingForJV:         mp.willingForJV         ?? null,
      assistanceNeeded:     mp.assistanceNeeded     || [],
      assistanceOtherDetails: mp.assistanceOtherDetails || '',
    },
  })
  const assistanceNeeded = watch('assistanceNeeded')
  const showOther = assistanceNeeded?.includes('Other')

  async function onSubmit(data) {
    setServerError('')
    setSubmitting(true)
    try {
      await setDoc(doc(db, 'farmers', uid, 'marketProfile', 'marketProfile'), {
        farmingCommitment:      data.farmingCommitment,
        willingToFollowPlans:   data.willingToFollowPlans,
        willingForJV:           data.willingForJV,
        assistanceNeeded:       data.assistanceNeeded,
        assistanceOtherDetails: showOther ? data.assistanceOtherDetails : '',
      }, { merge: true })
      onSuccess()
    } catch (err) {
      console.error('Step 5:', err)
      setServerError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Field label="Farming Commitment">
        <Controller name="farmingCommitment" control={control} rules={{ required: 'Please select an option' }}
          render={({ field, fieldState }) =>
            <RadioGroup options={['Full-time', 'Part-time']} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <Field label="Willing to follow structured production plans?">
        <Controller name="willingToFollowPlans" control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
          render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <Field label="Are you willing to enter a structured Joint Venture agreement with AEN?">
        <Controller name="willingForJV" control={control} rules={{ validate: v => v !== null || 'Please select an option' }}
          render={({ field, fieldState }) => <YesNoToggle value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      </Field>
      <Field label="What areas do you need assistance with?">
        <Controller name="assistanceNeeded" control={control}
          rules={{ validate: v => v?.length > 0 || 'Please select at least one area' }}
          render={({ field, fieldState }) => (
            <>
              <MultiCheckbox options={ASSISTANCE_OPTIONS} value={field.value} onChange={field.onChange} />
              {fieldState.error && <p className="text-xs text-red-600 mt-1" role="alert">{fieldState.error.message}</p>}
            </>
          )} />
      </Field>
      {showOther && (
        <Input label="Please specify other assistance needed" placeholder="Describe what you need..." error={errors.assistanceOtherDetails?.message}
          {...register('assistanceOtherDetails', { required: 'Please specify' })} />
      )}
      <SaveErr msg={serverError} />
      <FormButtons submitting={submitting} onBack={onBack} />
    </form>
  )
}

// ─── Step 6: Declaration & JV Agreement ───────────────────────────────────────

function Step6({ uid, savedData, onBack }) {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { declarationName: savedData?.fullName || '' },
  })
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  async function onSubmit(data) {
    setServerError('')
    setSubmitting(true)
    try {
      await setDoc(doc(db, 'farmers', uid), {
        profileComplete: true, jvAgreementAccepted: true,
        jvAgreementDate: serverTimestamp(), declarationName: data.declarationName,
      }, { merge: true })
      navigate('/dashboard')
    } catch (err) {
      console.error('Step 6:', err)
      setServerError('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="bg-[var(--color-surface-2)] rounded-xl p-4 border border-[var(--color-border)]">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
          By proceeding, you confirm your understanding of the following:
        </p>
        <ul className="flex flex-col gap-2">
          {JV_TERMS.map((term, i) => (
            <li key={i} className="flex gap-2 text-sm text-[var(--color-text-primary)]">
              <span className="text-[var(--color-primary)] flex-shrink-0 mt-0.5">•</span>{term}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed bg-[var(--color-primary)]/10 rounded-xl p-4 border border-[var(--color-primary)]/20 italic">
        "I confirm that the information provided above is true and I am willing to participate
        in a structured Joint Venture program with the Agripreneurs Empowerment Network (AEN)."
      </p>
      <Input label="Full Name" placeholder="Your full name" error={errors.declarationName?.message}
        {...register('declarationName', { required: 'Please confirm your full name' })} />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">Date</span>
        <p className="text-sm text-[var(--color-text-primary)] px-3 py-2.5 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">{today}</p>
      </div>
      <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${errors.declarationAccepted ? 'border-red-400 bg-red-50' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-primary)]'}`}>
        <input type="checkbox" className="mt-0.5 w-5 h-5 flex-shrink-0 accent-[var(--color-primary)]"
          {...register('declarationAccepted', { required: 'You must accept the declaration to continue' })} />
        <span className="text-sm text-[var(--color-text-primary)]">
          I have read and understood the above and confirm the information I have provided is accurate.
        </span>
      </label>
      {errors.declarationAccepted && (
        <p className="text-xs text-red-600 -mt-3" role="alert">{errors.declarationAccepted.message}</p>
      )}
      <SaveErr msg={serverError} />
      <FormButtons submitting={submitting} onBack={onBack} submitLabel="Submit & Join AEN" />
    </form>
  )
}

// ─── Main Register component ──────────────────────────────────────────────────

export default function Register() {
  const { user, farmerProfile, loading } = useAuth()
  const [step, setStep] = useState(1)
  const [savedData, setSavedData] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    Promise.all([
      getDoc(doc(db, 'farmers', user.uid)),
      getDoc(doc(db, 'farmers', user.uid, 'farmProfile', 'farmProfile')),
      getDoc(doc(db, 'farmers', user.uid, 'infrastructure', 'infrastructure')),
      getDoc(doc(db, 'farmers', user.uid, 'marketProfile', 'marketProfile')),
      getDoc(doc(db, 'farmers', user.uid, 'empowerment', 'empowerment')),
    ]).then(([farmer, fp, infra, market, emp]) => {
      setSavedData({
        ...farmer.data(),
        farmProfile:   fp.data()     || {},
        infrastructure: infra.data() || {},
        marketProfile: market.data() || {},
        empowerment:   emp.data()    || {},
      })
    }).catch(console.error)
      .finally(() => setDataLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="min-h-[calc(100svh-56px)] flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  if (user && farmerProfile?.profileComplete) {
    return <Navigate to="/dashboard" replace />
  }

  const isOnboarding = !!user
  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)
  const sp = { uid: user?.uid, savedData, onSuccess: next, onBack: back }

  return (
    <div
      className="min-h-[calc(100svh-56px)] flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="w-full max-w-lg">
        <div className="glass-card p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          {!isOnboarding ? (
            <AccountCreationForm onSuccess={() => {}} />
          ) : dataLoading || !savedData ? (
            <div className="flex justify-center py-16"><Spinner size="lg" color="green" /></div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src="/icons/aen-logohandsbrwn.svg" alt="AEN" className="h-5 w-5 object-contain" />
                <span className="font-bold gradient-text">AEN</span>
              </div>
              <ProgressBar step={step} />
              {step === 1 && <Step1 {...sp} onBack={undefined} />}
              {step === 2 && <Step2 {...sp} />}
              {step === 3 && <Step3 {...sp} />}
              {step === 4 && <Step4 {...sp} />}
              {step === 5 && <Step5 {...sp} />}
              {step === 6 && <Step6 uid={user.uid} savedData={savedData} onBack={back} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
