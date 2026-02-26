import { useEffect, useState, useMemo } from 'react';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import moment from 'moment';
import 'moment-hijri';
import { Clock, MapPin, Calendar, Info, Utensils, Moon, Languages } from 'lucide-react';

// Fallback Coordinates (London)
const DEFAULT_COORDS = new Coordinates(51.5074, -0.1278);

// Common Iqamah offsets (in minutes)
const IQAMAH_OFFSETS = {
  fajr: 20,
  dhuhr: 15,
  asr: 15,
  maghrib: 5,
  isha: 15,
};

// Translations
const translations = {
  bn: {
    mosqueName: 'ডিজিটাল নামাজের সময়সূচী',
    sehriIftar: 'সেহরি ও ইফতার',
    sehriEnd: 'সেহরি শেষ',
    sehri: 'সেহরি',
    iftarStart: 'ইফতার শুরু',
    iftar: 'ইফতার',
    prayer: 'নামাজ',
    start: 'শুরু',
    iqamah: 'ইকামত',
    next: 'পরবর্তী',
    footer: 'JUBAIDA AIR INTERNATIONAL',
    selectDistrict: 'জেলা নির্বাচন করুন',
    prayers: ['ফজর', 'যোহর', 'আসর', 'মাগরিব', 'এশা'],
    days: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
    months: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
  },
  en: {
    mosqueName: 'Digital Prayer Timetable',
    sehriIftar: 'Sehri & Iftar',
    sehriEnd: 'Sehri Ends',
    sehri: 'Sehri',
    iftarStart: 'Iftar Starts',
    iftar: 'Iftar',
    prayer: 'Prayer',
    start: 'Start',
    iqamah: 'Iqamah',
    next: 'Next',
    footer: 'JUBAIDA AIR INTERNATIONAL',
    selectDistrict: 'Select District',
    prayers: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  }
};

const BANGLADESH_DISTRICTS = [
  { name: { bn: 'ঢাকা', en: 'Dhaka' }, lat: 23.8103, lng: 90.4125 },
  { name: { bn: 'চট্টগ্রাম', en: 'Chittagong' }, lat: 22.3569, lng: 91.7832 },
  { name: { bn: 'সিলেট', en: 'Sylhet' }, lat: 24.8949, lng: 91.8687 },
  { name: { bn: 'রাজশাহী', en: 'Rajshahi' }, lat: 24.3745, lng: 88.6042 },
  { name: { bn: 'খুলনা', en: 'Khulna' }, lat: 22.8456, lng: 89.5403 },
  { name: { bn: 'বরিশাল', en: 'Barisal' }, lat: 22.7010, lng: 90.3535 },
  { name: { bn: 'রংপুর', en: 'Rangpur' }, lat: 25.7439, lng: 89.2752 },
  { name: { bn: 'ময়মনসিংহ', en: 'Mymensingh' }, lat: 24.7471, lng: 90.4203 },
  { name: { bn: 'কুমিল্লা', en: 'Comilla' }, lat: 23.4607, lng: 91.1809 },
  { name: { bn: 'নারায়ণগঞ্জ', en: 'Narayanganj' }, lat: 23.6238, lng: 90.5000 },
  { name: { bn: 'গাজীপুর', en: 'Gazipur' }, lat: 24.0023, lng: 90.4264 },
  { name: { bn: 'ফেনী', en: 'Feni' }, lat: 23.0159, lng: 91.3976 },
  { name: { bn: 'নোয়াখালী', en: 'Noakhali' }, lat: 22.8696, lng: 91.0994 },
  { name: { bn: 'লক্ষ্মীপুর', en: 'Lakshmipur' }, lat: 22.9429, lng: 90.8417 },
  { name: { bn: 'চাঁদপুর', en: 'Chandpur' }, lat: 23.2333, lng: 90.6500 },
  { name: { bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria' }, lat: 23.9571, lng: 91.1119 },
  { name: { bn: 'কক্সবাজার', en: 'Cox\'s Bazar' }, lat: 21.4272, lng: 91.9702 },
  { name: { bn: 'রাঙ্গামাটি', en: 'Rangamati' }, lat: 22.6556, lng: 92.1750 },
  { name: { bn: 'বান্দরবান', en: 'Bandarban' }, lat: 22.1953, lng: 92.2184 },
  { name: { bn: 'খাগড়াছড়ি', en: 'Khagrachhari' }, lat: 23.1192, lng: 91.9841 },
  { name: { bn: 'সিরাজগঞ্জ', en: 'Sirajganj' }, lat: 24.4534, lng: 89.7007 },
  { name: { bn: 'পাবনা', en: 'Pabna' }, lat: 24.0063, lng: 89.2493 },
  { name: { bn: 'বগুড়া', en: 'Bogra' }, lat: 24.8481, lng: 89.3730 },
  { name: { bn: 'নাটোর', en: 'Natore' }, lat: 24.4102, lng: 88.9595 },
  { name: { bn: 'নওগাঁ', en: 'Naogaon' }, lat: 24.7936, lng: 88.9318 },
  { name: { bn: 'জয়পুরহাট', en: 'Joypurhat' }, lat: 25.0947, lng: 89.0209 },
  { name: { bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapai Nawabganj' }, lat: 24.5965, lng: 88.2716 },
  { name: { bn: 'কুষ্টিয়া', en: 'Kushtia' }, lat: 23.9013, lng: 89.1204 },
  { name: { bn: 'যশোর', en: 'Jessore' }, lat: 23.1664, lng: 89.2081 },
  { name: { bn: 'সাতক্ষীরা', en: 'Satkhira' }, lat: 22.7185, lng: 89.0705 },
  { name: { bn: 'বাগেরহাট', en: 'Bagerhat' }, lat: 22.6516, lng: 89.7859 },
  { name: { bn: 'ঝিনাইদহ', en: 'Jhenaidah' }, lat: 23.5450, lng: 89.1726 },
  { name: { bn: 'মাগুরা', en: 'Magura' }, lat: 23.4873, lng: 89.4199 },
  { name: { bn: 'নড়াইল', en: 'Narail' }, lat: 23.1725, lng: 89.5126 },
  { name: { bn: 'চুয়াডাঙ্গা', en: 'Chuadanga' }, lat: 23.6401, lng: 88.8418 },
  { name: { bn: 'মেহেরপুর', en: 'Meherpur' }, lat: 23.7622, lng: 88.6318 },
  { name: { bn: 'ভোলা', en: 'Bhola' }, lat: 22.6859, lng: 90.6412 },
  { name: { bn: 'পটুয়াখালী', en: 'Patuakhali' }, lat: 22.3596, lng: 90.3350 },
  { name: { bn: 'বরগুনা', en: 'Barguna' }, lat: 22.1591, lng: 90.1262 },
  { name: { bn: 'ঝালকাঠি', en: 'Jhalokati' }, lat: 22.6406, lng: 90.1987 },
  { name: { bn: 'পিরোজপুর', en: 'Pirojpur' }, lat: 22.5841, lng: 89.9751 },
  { name: { bn: 'সুনামগঞ্জ', en: 'Sunamganj' }, lat: 25.0658, lng: 91.3950 },
  { name: { bn: 'হবিগঞ্জ', en: 'Habiganj' }, lat: 24.3749, lng: 91.4133 },
  { name: { bn: 'মৌলভীবাজার', en: 'Moulvibazar' }, lat: 24.4829, lng: 91.7606 },
  { name: { bn: 'দিনাজপুর', en: 'Dinajpur' }, lat: 25.6217, lng: 88.6354 },
  { name: { bn: 'ঠাকুরগাঁও', en: 'Thakurgaon' }, lat: 26.0337, lng: 88.4617 },
  { name: { bn: 'পঞ্চগড়', en: 'Panchagarh' }, lat: 26.3411, lng: 88.5541 },
  { name: { bn: 'নীলফামারী', en: 'Nilphamari' }, lat: 25.9317, lng: 88.8560 },
  { name: { bn: 'লালমনিরহাট', en: 'Lalmonirhat' }, lat: 25.9165, lng: 89.4532 },
  { name: { bn: 'কুড়িগ্রাম', en: 'Kurigram' }, lat: 25.8054, lng: 89.6361 },
  { name: { bn: 'গাইবান্ধা', en: 'Gaibandha' }, lat: 25.3287, lng: 89.5280 },
  { name: { bn: 'শেরপুর', en: 'Sherpur' }, lat: 25.0188, lng: 90.0175 },
  { name: { bn: 'জামালপুর', en: 'Jamalpur' }, lat: 24.9197, lng: 89.9454 },
  { name: { bn: 'নেত্রকোনা', en: 'Netrokona' }, lat: 24.8700, lng: 90.7275 },
  { name: { bn: 'কিশোরগঞ্জ', en: 'Kishoreganj' }, lat: 24.4449, lng: 90.7766 },
  { name: { bn: 'মানিকগঞ্জ', en: 'Manikganj' }, lat: 23.8644, lng: 90.0047 },
  { name: { bn: 'মুন্সীগঞ্জ', en: 'Munshiganj' }, lat: 23.5422, lng: 90.5305 },
  { name: { bn: 'রাজবাড়ী', en: 'Rajbari' }, lat: 23.7574, lng: 89.6444 },
  { name: { bn: 'মাদারীপুর', en: 'Madaripur' }, lat: 23.1641, lng: 90.1896 },
  { name: { bn: 'গোপালগঞ্জ', en: 'Gopalganj' }, lat: 23.0059, lng: 89.8267 },
  { name: { bn: 'শরীয়তপুর', en: 'Shariatpur' }, lat: 23.2423, lng: 90.4348 },
  { name: { bn: 'টাঙ্গাইল', en: 'Tangail' }, lat: 24.2513, lng: 89.9167 },
  { name: { bn: 'ফরিদপুর', en: 'Faridpur' }, lat: 23.6071, lng: 89.8429 },
  { name: { bn: 'নরসিংদী', en: 'Narsingdi' }, lat: 23.9229, lng: 90.7177 }
].sort((a, b) => a.name.en.localeCompare(b.name.en));

export default function App() {
  const [now, setNow] = useState(new Date());
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COORDS);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dhaka');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  const t = translations[lang];

  // Helper to convert numbers to Bengali digits
  const toBengaliDigits = (num: string | number) => {
    if (lang === 'en') return num.toString();
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d)]);
  };

  // Helper to format time based on language
  const formatTime = (date: Date, includeSeconds: boolean = false) => {
    const formatStr = includeSeconds ? 'h:mm:ss' : 'h:mm';
    const timeStr = moment(date).format(formatStr);
    return toBengaliDigits(timeStr);
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const district = BANGLADESH_DISTRICTS.find(d => d.name.en === selectedDistrict);
    if (district) {
      setCoords(new Coordinates(district.lat, district.lng));
    }
  }, [selectedDistrict]);

  const prayerData = useMemo(() => {
    const params = CalculationMethod.MoonsightingCommittee();
    const date = now;
    const prayerTimes = new PrayerTimes(coords, date, params);

    const prayers = [
      { name: t.prayers[0], start: prayerTimes.fajr, iqamah: moment(prayerTimes.fajr).add(IQAMAH_OFFSETS.fajr, 'minutes').toDate() },
      { name: t.prayers[1], start: prayerTimes.dhuhr, iqamah: moment(prayerTimes.dhuhr).add(IQAMAH_OFFSETS.dhuhr, 'minutes').toDate() },
      { name: t.prayers[2], start: prayerTimes.asr, iqamah: moment(prayerTimes.asr).add(IQAMAH_OFFSETS.asr, 'minutes').toDate() },
      { name: t.prayers[3], start: prayerTimes.maghrib, iqamah: moment(prayerTimes.maghrib).add(IQAMAH_OFFSETS.maghrib, 'minutes').toDate() },
      { name: t.prayers[4], start: prayerTimes.isha, iqamah: moment(prayerTimes.isha).add(IQAMAH_OFFSETS.isha, 'minutes').toDate() },
    ];

    // Find next prayer
    let nextIndex = prayers.findIndex(p => p.start > now);
    if (nextIndex === -1) nextIndex = 0;

    return {
      prayers,
      nextIndex,
      sunrise: prayerTimes.sunrise,
      ishraq: moment(prayerTimes.sunrise).add(15, 'minutes').toDate(),
      zawaal: moment(prayerTimes.dhuhr).subtract(10, 'minutes').toDate(),
      sehri: prayerTimes.fajr, // Sehri ends at Fajr start
      iftar: prayerTimes.maghrib, // Iftar starts at Maghrib start
    };
  }, [now, coords, t]);

  const { prayers, nextIndex, sunrise, ishraq, zawaal, sehri, iftar } = prayerData;

  const getDateString = () => {
    const dayName = t.days[now.getDay()];
    const day = toBengaliDigits(now.getDate());
    const monthName = t.months[now.getMonth()];
    const year = toBengaliDigits(now.getFullYear());
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-[#1A1A1A]">
      {/* Header Section */}
      <header className="bg-[#151619] text-white p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-white/10 hover:bg-white/20 text-white border-none rounded-full px-4 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all cursor-pointer"
          >
            {BANGLADESH_DISTRICTS.map(d => (
              <option key={d.name.en} value={d.name.en} className="text-black">
                {lang === 'bn' ? d.name.bn : d.name.en}
              </option>
            ))}
          </select>

          <button 
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-xs sm:text-sm font-medium"
          >
            <Languages size={16} />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>

        <div className="z-10 flex flex-col items-center gap-2 w-full max-w-4xl mt-8 sm:mt-0">
          <div className="flex flex-col sm:flex-row items-center justify-center w-full mb-4 gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-medium opacity-80">{getDateString()}</span>
            </div>
          </div>

          <h1 className="text-6xl sm:text-8xl md:text-[10rem] font-bold leading-none tracking-tighter mb-4 tabular-nums text-center">
            {formatTime(now, true)}
          </h1>
          
          <div className="flex items-center gap-2 bg-white/5 px-4 py-1 rounded-full border border-white/10">
            <MapPin size={14} className="text-[#D4AF37]" />
            <span className="text-sm font-medium opacity-90">
              {lang === 'bn' ? BANGLADESH_DISTRICTS.find(d => d.name.en === selectedDistrict)?.name.bn : selectedDistrict}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 -mt-6 sm:-mt-12 z-20 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left Column: Sehri/Iftar & Stats */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          {/* Sehri & Iftar Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-black/5 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
            <h3 className="text-base sm:text-lg font-bold text-[#2D1B1B] border-b pb-2 flex items-center gap-2">
              <Utensils size={18} className="text-[#4CAF50]" />
              {t.sehriIftar}
            </h3>
            
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex justify-between items-center bg-[#FDF8F0] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#F2E8D5]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Moon size={16} className="text-[#2D1B1B]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.sehriEnd}</p>
                    <p className="text-base sm:text-xl font-bold text-[#2D1B1B]">{t.sehri}</p>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#2D1B1B] tabular-nums">
                  {formatTime(sehri)}
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#F0F9F1] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#D5F2D8]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Utensils size={16} className="text-[#4CAF50]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.iftarStart}</p>
                    <p className="text-base sm:text-xl font-bold text-[#4CAF50]">{t.iftar}</p>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#4CAF50] tabular-nums">
                  {formatTime(iftar)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prayer Times Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-black/5">
            <div className="grid grid-cols-3 bg-[#2D1B1B] text-white/50 text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.2em] py-3 sm:py-4 px-4 sm:px-10 uppercase">
              <div className="flex items-center gap-1 sm:gap-2">
                 <Info size={12} />
                 <span>{t.prayer}</span>
              </div>
              <div className="text-center">{t.start}</div>
              <div className="text-right">{t.iqamah}</div>
            </div>

            <div className="divide-y divide-black/5">
              {prayers.map((prayer, idx) => (
                <div 
                  key={prayer.name}
                  className={`grid grid-cols-3 items-center py-4 sm:py-6 px-4 sm:px-10 transition-colors duration-500 ${
                    idx === nextIndex ? 'bg-[#FDF8F0]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className={`text-xl sm:text-3xl font-bold tracking-tight ${idx === nextIndex ? 'text-[#2D1B1B]' : 'text-gray-400'}`}>
                      {prayer.name}
                    </span>
                    {idx === nextIndex && (
                      <span className="bg-[#4CAF50] text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        {t.next}
                      </span>
                    )}
                  </div>
                  <div className="text-center text-2xl sm:text-4xl font-light text-gray-500 tabular-nums">
                    {formatTime(prayer.start)}
                  </div>
                  <div className="text-right text-2xl sm:text-4xl font-bold text-[#1A1A1A] tabular-nums">
                    {formatTime(prayer.iqamah)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>


      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-gray-400 text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.2em] sm:tracking-[0.3em]">
        {t.footer}
      </footer>
    </div>
  );
}
