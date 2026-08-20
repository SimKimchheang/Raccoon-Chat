import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function PersonalInformation() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [username, setUsername] = useState('');
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);

  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [messageB, setMessageB] = useState('');
  const [messageC, setMessageC] = useState('');
  const [messageBio, setMessageBio] = useState('');

  const countries = [
    { id: 'afghanistan', label: 'Afghanistan' },
    { id: 'albania', label: 'Albania' },
    { id: 'algeria', label: 'Algeria' },
    { id: 'andorra', label: 'Andorra' },
    { id: 'angola', label: 'Angola' },
    { id: 'antigua-and-barbuda', label: 'Antigua and Barbuda' },
    { id: 'argentina', label: 'Argentina' },
    { id: 'armenia', label: 'Armenia' },
    { id: 'australia', label: 'Australia' },
    { id: 'austria', label: 'Austria' },
    { id: 'azerbaijan', label: 'Azerbaijan' },
    { id: 'bahamas', label: 'Bahamas' },
    { id: 'bahrain', label: 'Bahrain' },
    { id: 'bangladesh', label: 'Bangladesh' },
    { id: 'barbados', label: 'Barbados' },
    { id: 'belarus', label: 'Belarus' },
    { id: 'belgium', label: 'Belgium' },
    { id: 'belize', label: 'Belize' },
    { id: 'benin', label: 'Benin' },
    { id: 'bhutan', label: 'Bhutan' },
    { id: 'bolivia', label: 'Bolivia' },
    { id: 'bosnia-and-herzegovina', label: 'Bosnia and Herzegovina' },
    { id: 'botswana', label: 'Botswana' },
    { id: 'brazil', label: 'Brazil' },
    { id: 'brunei', label: 'Brunei' },
    { id: 'bulgaria', label: 'Bulgaria' },
    { id: 'burkina-faso', label: 'Burkina Faso' },
    { id: 'burundi', label: 'Burundi' },
    { id: 'cabo-verde', label: 'Cabo Verde' },
    { id: 'cambodia', label: 'Cambodia' },
    { id: 'cameroon', label: 'Cameroon' },
    { id: 'canada', label: 'Canada' },
    { id: 'central-african-republic', label: 'Central African Republic' },
    { id: 'chad', label: 'Chad' },
    { id: 'chile', label: 'Chile' },
    { id: 'china', label: 'China' },
    { id: 'colombia', label: 'Colombia' },
    { id: 'comoros', label: 'Comoros' },
    { id: 'congo', label: 'Congo' },
    { id: 'costa-rica', label: 'Costa Rica' },
    { id: 'cote-divoire', label: "Côte d'Ivoire" },
    { id: 'croatia', label: 'Croatia' },
    { id: 'cuba', label: 'Cuba' },
    { id: 'cyprus', label: 'Cyprus' },
    { id: 'czechia', label: 'Czechia' },
    { id: 'democratic-republic-of-the-congo', label: 'Democratic Republic of the Congo' },
    { id: 'denmark', label: 'Denmark' },
    { id: 'djibouti', label: 'Djibouti' },
    { id: 'dominica', label: 'Dominica' },
    { id: 'dominican-republic', label: 'Dominican Republic' },
    { id: 'ecuador', label: 'Ecuador' },
    { id: 'egypt', label: 'Egypt' },
    { id: 'el-salvador', label: 'El Salvador' },
    { id: 'equatorial-guinea', label: 'Equatorial Guinea' },
    { id: 'eritrea', label: 'Eritrea' },
    { id: 'estonia', label: 'Estonia' },
    { id: 'eswatini', label: 'Eswatini' },
    { id: 'ethiopia', label: 'Ethiopia' },
    { id: 'fiji', label: 'Fiji' },
    { id: 'finland', label: 'Finland' },
    { id: 'france', label: 'France' },
    { id: 'gabon', label: 'Gabon' },
    { id: 'gambia', label: 'Gambia' },
    { id: 'georgia', label: 'Georgia' },
    { id: 'germany', label: 'Germany' },
    { id: 'ghana', label: 'Ghana' },
    { id: 'greece', label: 'Greece' },
    { id: 'grenada', label: 'Grenada' },
    { id: 'guatemala', label: 'Guatemala' },
    { id: 'guinea', label: 'Guinea' },
    { id: 'guinea-bissau', label: 'Guinea-Bissau' },
    { id: 'guyana', label: 'Guyana' },
    { id: 'haiti', label: 'Haiti' },
    { id: 'honduras', label: 'Honduras' },
    { id: 'hungary', label: 'Hungary' },
    { id: 'iceland', label: 'Iceland' },
    { id: 'india', label: 'India' },
    { id: 'indonesia', label: 'Indonesia' },
    { id: 'iran', label: 'Iran' },
    { id: 'iraq', label: 'Iraq' },
    { id: 'ireland', label: 'Ireland' },
    { id: 'israel', label: 'Israel' },
    { id: 'italy', label: 'Italy' },
    { id: 'jamaica', label: 'Jamaica' },
    { id: 'japan', label: 'Japan' },
    { id: 'jordan', label: 'Jordan' },
    { id: 'kazakhstan', label: 'Kazakhstan' },
    { id: 'kenya', label: 'Kenya' },
    { id: 'kiribati', label: 'Kiribati' },
    { id: 'kuwait', label: 'Kuwait' },
    { id: 'kyrgyzstan', label: 'Kyrgyzstan' },
    { id: 'laos', label: 'Laos' },
    { id: 'latvia', label: 'Latvia' },
    { id: 'lebanon', label: 'Lebanon' },
    { id: 'lesotho', label: 'Lesotho' },
    { id: 'liberia', label: 'Liberia' },
    { id: 'libya', label: 'Libya' },
    { id: 'liechtenstein', label: 'Liechtenstein' },
    { id: 'lithuania', label: 'Lithuania' },
    { id: 'luxembourg', label: 'Luxembourg' },
    { id: 'madagascar', label: 'Madagascar' },
    { id: 'malawi', label: 'Malawi' },
    { id: 'malaysia', label: 'Malaysia' },
    { id: 'maldives', label: 'Maldives' },
    { id: 'mali', label: 'Mali' },
    { id: 'malta', label: 'Malta' },
    { id: 'marshall-islands', label: 'Marshall Islands' },
    { id: 'mauritania', label: 'Mauritania' },
    { id: 'mauritius', label: 'Mauritius' },
    { id: 'mexico', label: 'Mexico' },
    { id: 'micronesia', label: 'Micronesia' },
    { id: 'moldova', label: 'Moldova' },
    { id: 'monaco', label: 'Monaco' },
    { id: 'mongolia', label: 'Mongolia' },
    { id: 'montenegro', label: 'Montenegro' },
    { id: 'morocco', label: 'Morocco' },
    { id: 'mozambique', label: 'Mozambique' },
    { id: 'myanmar', label: 'Myanmar' },
    { id: 'namibia', label: 'Namibia' },
    { id: 'nauru', label: 'Nauru' },
    { id: 'nepal', label: 'Nepal' },
    { id: 'netherlands', label: 'Netherlands' },
    { id: 'new-zealand', label: 'New Zealand' },
    { id: 'nicaragua', label: 'Nicaragua' },
    { id: 'niger', label: 'Niger' },
    { id: 'nigeria', label: 'Nigeria' },
    { id: 'north-korea', label: 'North Korea' },
    { id: 'north-macedonia', label: 'North Macedonia' },
    { id: 'norway', label: 'Norway' },
    { id: 'oman', label: 'Oman' },
    { id: 'pakistan', label: 'Pakistan' },
    { id: 'palau', label: 'Palau' },
    { id: 'palestine', label: 'Palestine' },
    { id: 'panama', label: 'Panama' },
    { id: 'papua-new-guinea', label: 'Papua New Guinea' },
    { id: 'paraguay', label: 'Paraguay' },
    { id: 'peru', label: 'Peru' },
    { id: 'philippines', label: 'Philippines' },
    { id: 'poland', label: 'Poland' },
    { id: 'portugal', label: 'Portugal' },
    { id: 'qatar', label: 'Qatar' },
    { id: 'romania', label: 'Romania' },
    { id: 'russia', label: 'Russia' },
    { id: 'rwanda', label: 'Rwanda' },
    { id: 'saint-kitts-and-nevis', label: 'Saint Kitts and Nevis' },
    { id: 'saint-lucia', label: 'Saint Lucia' },
    { id: 'saint-vincent-and-the-grenadines', label: 'Saint Vincent and the Grenadines' },
    { id: 'samoa', label: 'Samoa' },
    { id: 'san-marino', label: 'San Marino' },
    { id: 'sao-tome-and-principe', label: 'São Tomé and Príncipe' },
    { id: 'saudi-arabia', label: 'Saudi Arabia' },
    { id: 'senegal', label: 'Senegal' },
    { id: 'serbia', label: 'Serbia' },
    { id: 'seychelles', label: 'Seychelles' },
    { id: 'sierra-leone', label: 'Sierra Leone' },
    { id: 'singapore', label: 'Singapore' },
    { id: 'slovakia', label: 'Slovakia' },
    { id: 'slovenia', label: 'Slovenia' },
    { id: 'solomon-islands', label: 'Solomon Islands' },
    { id: 'somalia', label: 'Somalia' },
    { id: 'south-africa', label: 'South Africa' },
    { id: 'south-korea', label: 'South Korea' },
    { id: 'south-sudan', label: 'South Sudan' },
    { id: 'spain', label: 'Spain' },
    { id: 'sri-lanka', label: 'Sri Lanka' },
    { id: 'sudan', label: 'Sudan' },
    { id: 'suriname', label: 'Suriname' },
    { id: 'sweden', label: 'Sweden' },
    { id: 'switzerland', label: 'Switzerland' },
    { id: 'syria', label: 'Syria' },
    { id: 'tajikistan', label: 'Tajikistan' },
    { id: 'tanzania', label: 'Tanzania' },
    { id: 'thailand', label: 'Thailand' },
    { id: 'timor-leste', label: 'Timor-Leste' },
    { id: 'togo', label: 'Togo' },
    { id: 'tonga', label: 'Tonga' },
    { id: 'trinidad-and-tobago', label: 'Trinidad and Tobago' },
    { id: 'tunisia', label: 'Tunisia' },
    { id: 'turkey', label: 'Türkiye' },
    { id: 'turkmenistan', label: 'Turkmenistan' },
    { id: 'tuvalu', label: 'Tuvalu' },
    { id: 'uganda', label: 'Uganda' },
    { id: 'ukraine', label: 'Ukraine' },
    { id: 'united-arab-emirates', label: 'United Arab Emirates' },
    { id: 'united-kingdom', label: 'United Kingdom' },
    { id: 'united-states', label: 'United States' },
    { id: 'uruguay', label: 'Uruguay' },
    { id: 'uzbekistan', label: 'Uzbekistan' },
    { id: 'vanuatu', label: 'Vanuatu' },
    { id: 'vatican-city', label: 'Vatican City' },
    { id: 'venezuela', label: 'Venezuela' },
    { id: 'vietnam', label: 'Vietnam' },
    { id: 'yemen', label: 'Yemen' },
    { id: 'zambia', label: 'Zambia' },
    { id: 'zimbabwe', label: 'Zimbabwe' }
  ];

  const countryFlagMap = {
    afghanistan: 'af', albania: 'al', algeria: 'dz', andorra: 'ad', angola: 'ao',
    'antigua-and-barbuda': 'ag', argentina: 'ar', armenia: 'am', australia: 'au', austria: 'at',
    azerbaijan: 'az', bahamas: 'bs', bahrain: 'bh', bangladesh: 'bd', barbados: 'bb',
    belarus: 'by', belgium: 'be', belize: 'bz', benin: 'bj', bhutan: 'bt', bolivia: 'bo',
    'bosnia-and-herzegovina': 'ba', botswana: 'bw', brazil: 'br', brunei: 'bn', bulgaria: 'bg',
    'burkina-faso': 'bf', burundi: 'bi', 'cabo-verde': 'cv', cambodia: 'kh', cameroon: 'cm',
    canada: 'ca', 'central-african-republic': 'cf', chad: 'td', chile: 'cl', china: 'cn',
    colombia: 'co', comoros: 'km', congo: 'cg', 'costa-rica': 'cr', 'cote-divoire': 'ci',
    croatia: 'hr', cuba: 'cu', cyprus: 'cy', czechia: 'cz',
    'democratic-republic-of-the-congo': 'cd', denmark: 'dk', djibouti: 'dj', dominica: 'dm',
    'dominican-republic': 'do', ecuador: 'ec', egypt: 'eg', 'el-salvador': 'sv',
    'equatorial-guinea': 'gq', eritrea: 'er', estonia: 'ee', eswatini: 'sz', ethiopia: 'et',
    fiji: 'fj', finland: 'fi', france: 'fr', gabon: 'ga', gambia: 'gm', georgia: 'ge',
    germany: 'de', ghana: 'gh', greece: 'gr', grenada: 'gd', guatemala: 'gt', guinea: 'gn',
    'guinea-bissau': 'gw', guyana: 'gy', haiti: 'ht', honduras: 'hn', hungary: 'hu',
    iceland: 'is', india: 'in', indonesia: 'id', iran: 'ir', iraq: 'iq', ireland: 'ie',
    israel: 'il', italy: 'it', jamaica: 'jm', japan: 'jp', jordan: 'jo', kazakhstan: 'kz',
    kenya: 'ke', kiribati: 'ki', kuwait: 'kw', kyrgyzstan: 'kg', laos: 'la', latvia: 'lv',
    lebanon: 'lb', lesotho: 'ls', liberia: 'lr', libya: 'ly', liechtenstein: 'li',
    lithuania: 'lt', luxembourg: 'lu', madagascar: 'mg', malawi: 'mw', malaysia: 'my',
    maldives: 'mv', mali: 'ml', malta: 'mt', 'marshall-islands': 'mh', mauritania: 'mr',
    mauritius: 'mu', mexico: 'mx', micronesia: 'fm', moldova: 'md', monaco: 'mc',
    mongolia: 'mn', montenegro: 'me', morocco: 'ma', mozambique: 'mz', myanmar: 'mm',
    namibia: 'na', nauru: 'nr', nepal: 'np', netherlands: 'nl', 'new-zealand': 'nz',
    nicaragua: 'ni', niger: 'ne', nigeria: 'ng', 'north-korea': 'kp', 'north-macedonia': 'mk',
    norway: 'no', oman: 'om', pakistan: 'pk', palau: 'pw', palestine: 'ps', panama: 'pa',
    'papua-new-guinea': 'pg', paraguay: 'py', peru: 'pe', philippines: 'ph', poland: 'pl',
    portugal: 'pt', qatar: 'qa', romania: 'ro', russia: 'ru', rwanda: 'rw',
    'saint-kitts-and-nevis': 'kn', 'saint-lucia': 'lc', 'saint-vincent-and-the-grenadines': 'vc',
    samoa: 'ws', 'san-marino': 'sm', 'sao-tome-and-principe': 'st', 'saudi-arabia': 'sa',
    senegal: 'sn', serbia: 'rs', seychelles: 'sc', 'sierra-leone': 'sl', singapore: 'sg',
    slovakia: 'sk', slovenia: 'si', 'solomon-islands': 'sb', somalia: 'so', 'south-africa': 'za',
    'south-korea': 'kr', 'south-sudan': 'ss', spain: 'es', 'sri-lanka': 'lk', sudan: 'sd',
    suriname: 'sr', sweden: 'se', switzerland: 'ch', syria: 'sy', tajikistan: 'tj',
    tanzania: 'tz', thailand: 'th', 'timor-leste': 'tl', togo: 'tg', tonga: 'to',
    'trinidad-and-tobago': 'tt', tunisia: 'tn', turkey: 'tr', turkmenistan: 'tm',
    tuvalu: 'tv', uganda: 'ug', ukraine: 'ua', 'united-arab-emirates': 'ae', 'united-kingdom': 'gb',
    'united-states': 'us', uruguay: 'uy', uzbekistan: 'uz', vanuatu: 'vu', 'vatican-city': 'va',
    venezuela: 've', vietnam: 'vn', yemen: 'ye', zambia: 'zm', zimbabwe: 'zw'
  };

  const countriesWithFlags = countries.map((country) => ({
    ...country,
    flag: `https://flagcdn.com/w40/${countryFlagMap[country.id] || 'us'}.png`
  }));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.username) {
            setUsername(userData.username);
          } else if (currentUser.displayName) {
            setUsername(currentUser.displayName);
          }

          setBirthday(userData.birthday || '');
          setCountry(userData.country || '');
          setBio(userData.bio || '');
        }
      } catch (err) {
        console.error("Error fetching:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  const selectedCountry = countriesWithFlags.find((countryOption) => countryOption.id === country);

  const handleUsernameSave = async () => {
    if (!auth.currentUser) {
      setUsernameError("You must be logged in to update your username.");
      return;
    }

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setUsernameError("Username is required.");
      return;
    }

    setUsernameError("");
    setUsernameMessage("");

    try {
      await updateProfile(auth.currentUser, {
        displayName: trimmedUsername,
      });

      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { username: trimmedUsername },
        { merge: true }
      );

      setUser({ ...auth.currentUser, displayName: trimmedUsername });
      setUsernameMessage("Username updated successfully.");
    } catch (err) {
      setUsernameError(err.message || "Failed to update username");
    }
  };

  // --------------------------- Bio -------------------------------------
  const MAX_BIO_LENGTH = 200; 
  const handleBioSave = async () => {
    if(!auth.currentUser) {
      setError("You must be logged in to save your bio"); 
      return;
    }
    const trimmedBio = bio.trim();
    if (trimmedBio.length > MAX_BIO_LENGTH) {
      setMessageBio(`Bio must be ${MAX_BIO_LENGTH} characters or less`);
      return;
    }

    setMessageBio("");

    try {
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { bio: trimmedBio},
        { merge: true }
      );

      setBio(trimmedBio);
      setMessageBio("Bio updated successfuly");
    } catch (error) {
      setMessageBio(error.messageBio || "Failed to update bio")
    }
  };

  // ------------------------ Birthday --------------------------------------
  const handleBirthdaySave = async () => {
    if (!auth.currentUser) {
      setError("You must be logged in to save your birthday.");
      return;
    }

    setError("");

    try {
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { birthday },
        { merge: true }
      );
      setMessageB("Birthday saved successfully.");
    } catch (err) {
      setError(err.messageB || "Failed to save birthday");
    }
  };
//  --------------------------------- Country ----------------------------
  const handleCountrySave = async () => {
    if (!auth.currentUser) {
      setError("You must be logged in to save your country.");
      return;
    }

    setError("");

    try {
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { country },
        { merge: true }
      );
      setMessageC("Country saved successfully.");
    } catch (err) {
      setError(err.messageC || "Failed to save country");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
          My Personal Information
        </h1>
        <p className="text-slate-400">Manage your profile details and personal information</p>
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
          <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Username</label>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500"
              placeholder="Enter your username"
            />
            <button
              type="button"
              onClick={handleUsernameSave}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors whitespace-nowrap"
            >
              Save
            </button>
          </div>
          {usernameError && (
            <p className="text-red-500 text-sm mt-3">{usernameError}</p>
          )}
          {usernameMessage && (
            <p className="text-green-500 text-sm mt-3">{usernameMessage}</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">

          <div className="flex items-center justify-between mb-3">
            <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">
              Bio
            </label>

            <span className="text-xs text-slate-500">
              {bio.length}/200
            </span>
          </div>

          <textarea
            value={bio}
            maxLength={200}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people something about you..."
            rows={4}
            className="thin-scrollbar w-full rounded-xl text-sm text-slate-300 border border-gray-600 bg-gray-800 px-4 py-3 outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500 resize-none"
          />

          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={handleBioSave}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors"
            >
              Save
            </button>
          </div>

          {messageBio && (
            <p className="text-sm text-slate-400 mt-3">
              {messageBio}
            </p>
          )}

        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
          <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Email Address</label>
          <p className="text-2xl font-bold text-white mt-2 break-all">{user?.email}</p>
          <p className="text-xs text-slate-400 mt-2">
            {user?.emailVerified ? "Verified ✓" : "Not verified"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
          <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Birthday</label>
          <div className="mt-3 flex items-center gap-3">
            <input 
              id='birthday'
              type="date" 
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500"
            />
            <button
              type="button"
              onClick={handleBirthdaySave}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors whitespace-nowrap"
            >
              Save
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
          {messageB && (
            <p className="text-green-500 text-sm mt-3">{messageB}</p>
          )}
        </div>  

        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors relative">
          <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Country</label>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setIsCountryMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-600 bg-gray-800 px-3 py-3 text-left text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {selectedCountry ? (
                    <img
                      src={selectedCountry.flag}
                      alt={selectedCountry.label}
                      className="w-6 h-4 object-cover rounded-sm border border-slate-600 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-4 flex-shrink-0" />
                  )}
                  <span className="truncate text-base">
                    {selectedCountry ? selectedCountry.label : "Select Country"}
                  </span>
                </div>
                <span className="text-xl text-slate-400">⌄</span>
              </button>

              {isCountryMenuOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
                  {countriesWithFlags.map((countryOption) => {
                    const isSelected = country === countryOption.id;

                    return (
                      <button
                        key={countryOption.id}
                        type="button"
                        onClick={() => {
                          setCountry(countryOption.id);
                          setIsCountryMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${
                          isSelected
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "text-slate-200 hover:bg-slate-700"
                        }`}
                      >
                        <img
                          src={countryOption.flag}
                          alt={countryOption.label}
                          className="w-6 h-4 object-cover rounded-sm border border-slate-600"
                        />
                        <span className="truncate">{countryOption.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCountrySave}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors whitespace-nowrap"
            >
              Save
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
          {messageC && (
            <p className="text-green-500 text-sm mt-3">{messageC}</p>
          )}
        </div>
      </div>
    </div>
  );
}
