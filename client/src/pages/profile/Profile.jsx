import { onAuthStateChanged, reload } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import ProfileOverview from "./ProfileOverview";
import { 
  Settings, LogOut, User2, Cake, Pencil, 
  Home, Earth, UserRound, Heart, BriefcaseBusiness 
} from "lucide-react";

import raccoon1Img from '../../assets/raccoon1.png'
import raccoon2Img from '../../assets/raccoon2.png'
import raccoon3Img from '../../assets/raccoon3.png'
import raccoon4Img from '../../assets/raccoon4.png'
import raccoon5Img from '../../assets/raccoon5.png'
import raccoon6Img from '../../assets/raccoon6.png'
import raccoon7Img from '../../assets/raccoon7.png'
import raccoon8Img from '../../assets/raccoon8.png'
import raccoon9Img from '../../assets/raccoon9.png'
import raccoon10Img from '../../assets/raccoon10.png'
import raccoonForAdminImg1 from '../../assets/raccoonForAdmin1.png'
import raccoonForAdminImg2 from '../../assets/raccoonForAdmin2.png'
import raccoonForAdminImg3 from '../../assets/raccoonForAdmin3.png'

export default function Profile() {
  const [avatar, setAvatar] = useState(null);
  const [user, setUser] = useState(null);
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [sex, setSex] = useState('');
  const [relationship, setRelationship] = useState('');
  const [employment, setEmployment] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const [openAvatar, setOpenAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [friends, setFriends] = useState(0);

  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState([]);
  const [status, setStatus] = useState('none');

  const [handle, setHandle] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [openHandleModal, setOpenHandleModal] = useState(false);
  const [message, setMessage] = useState('');

  const [isOpenedLogout, setIsOpenedLogout] = useState(false);

  const raccoonAvatars = [
  raccoon1Img,
  raccoon2Img,
  raccoon3Img,
  raccoon4Img,
  raccoon5Img,
  raccoon6Img,
  raccoon7Img,
  raccoon8Img,
  raccoon9Img,
  raccoon10Img,
  raccoonForAdminImg1,
  raccoonForAdminImg2,
  raccoonForAdminImg3,

  ];

  const setRightMenu = () => {
    setOpenProfileMenu(!openProfileMenu);
  }

  const profileItems = [
    {id: 'home', icon: Home, label: 'Home'},
    {id: 'profile', icon: User2, label: 'Profile'},
    {id: 'settings', icon: Settings, label: 'Settings'}
  ]

  const personalInfo = [
  { label: "Sex", value: sex || "Not set", icon: UserRound },
  { label: "Relationship Status", value: relationship || "Not set", icon: Heart },
  { label: "Employment Status", value: employment || "Not set", icon: BriefcaseBusiness },
  { label: "Birthday", value: birthday || "Not set", icon: Cake },
  { label: "Country", value: country || "Not set", icon: Earth },
  ];

  const profileTabs = [
    {id: 'overview', label: 'Overview'},
    // {id: 'details', label: 'Account Details'}
  ]

  const statusOptions = [
    { id: "none", label: "None", emoji: "⚪" },
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "sad", label: "Sad", emoji: "😢" },
    { id: "angry", label: "Angry", emoji: "😡" },
    { id: "focus", label: "Focus", emoji: "🎯" },
    { id: "busy", label: "Busy", emoji: "⛔" },
    { id: "sleeping", label: "Sleeping", emoji: "😴" },
    { id: "excited", label: "Excited", emoji: "🤩" },
    { id: "chill", label: "Chilling", emoji: "😎" },
    { id: "working", label: "Working", emoji: "💻" },
  ];

  const handleStatusChange = async (newStatus) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          status: newStatus,
        },
        { merge: true }
      );

      setStatus(newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setAvatar(null);
        setHandle('');
        setNewHandle('');
        setStatus('none');
        setFollowers(0);
        setFollowing(0);
        setFriends(0);
        setSocialLinks([]);
        setBio('');
        setSex('');
        setRelationship('');
        setEmployment('');
        setBirthday('');
        setCountry('');
        return;
      }

      await reload(currentUser);
      setUser(currentUser);

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAvatar(userData.avatar ?? null);
          setFollowers(userData.followersCount ?? 0);
          setFollowing(userData.followingCount ?? 0);
          setFriends(userData.friendsCount ?? 0);
          setStatus(userData.status || 'none');
          setSocialLinks(userData.socialLinks || []);
          setBio(userData.bio || '');
          setSex(userData.sex || '');
          setRelationship(userData.relationship || '');
          setEmployment(userData.employment || '');
          setBirthday(userData.birthday || '');
          setCountry(userData.country || '');

          if (userData.handle) {
            setHandle(userData.handle);
          } else {

            const randomName = `${currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              'User'}_${Math.floor(1000 + Math.random() * 9000)}`
              .replace(/\s+/g, "_")
              .toLowerCase();

            const userRef = doc(db, "users", currentUser.uid);
            const handleRef = doc(db, "handles", randomName);

            await runTransaction(db, async (transaction) => {
              const handleDoc = await transaction.get(handleRef);

              if (handleDoc.exists()) {
                throw new Error("HANDLE_EXISTS");
              }

              transaction.set(
                userRef,
                {
                  handle: randomName,
                },
                { merge: true }
              );

              transaction.set(handleRef, {
                uid: currentUser.uid,
              });
            });

            setHandle(randomName);
            setNewHandle(randomName);

          }

        
        }  
      } catch (err) {
        console.error("Error fetching:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Avatar Handling
  const handleAvatar = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("You must be logged in");
      return;
    }

    try {
      if (selectedAvatar === null) return;

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          avatar: selectedAvatar,
        },
        { merge: true }
      );

      setAvatar(selectedAvatar);
      setOpenAvatar(false);

    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateHandle = async () => {
    if (!user) return;

    const formattedHandle = newHandle
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

    if (formattedHandle.length < 3) {
      setMessage("At least 3 characters");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(formattedHandle)) {
      setMessage("Only letters, numbers, and underscores are allowed");
      return;
    }

    // Nothing changed
    if (formattedHandle === handle.toLowerCase()) {
      setMessage("");
      setOpenHandleModal(false);
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);

        // New handle document
        const newHandleRef = doc(db, "handles", formattedHandle);

        // Check if new handle already exists
        const newHandleDoc = await transaction.get(newHandleRef);

        if (
          newHandleDoc.exists() &&
          newHandleDoc.data().uid !== user.uid
        ) {
          throw new Error("HANDLE_TAKEN");
        }

        // Delete old handle
        if (handle) {
          const oldHandleRef = doc(
            db,
            "handles",
            handle.toLowerCase()
          );

          const oldHandleDoc = await transaction.get(oldHandleRef);

          if (
            oldHandleDoc.exists() &&
            oldHandleDoc.data().uid === user.uid
          ) {
            transaction.delete(oldHandleRef);
          }
        }

        // Create new handle reservation
        transaction.set(newHandleRef, {
          uid: user.uid,
        });

        // Update user's profile
        transaction.set(
          userRef,
          {
            handle: formattedHandle,
          },
          { merge: true }
        );
      });

      setHandle(formattedHandle);
      setNewHandle(formattedHandle);
      setMessage("");
      setOpenHandleModal(false);

    } catch (err) {
      console.error("Error updating handle:", err);

      if (err.message === "HANDLE_TAKEN") {
        setMessage("This handle is already taken");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };  

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen
          w-72
          p-4 lg:p-6

          bg-black
          shadow-2xl
          border-r border-slate-700

          overflow-y-auto
          thin-scrollbar

          transition-transform duration-300

          ${isOpen ? "translate-x-0" : "-translate-x-full"}

          lg:static
          lg:translate-x-0
          lg:w-72
          lg:flex-shrink-0
        `}
      >
        {/* Close button — only mobile */}
        <button onClick={() => setIsOpen(false)} className="lg:hidden mb-4">
          ✕
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            Raccoon
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider">
            My Profile
          </p>
        </div>

        {/* User Avatar Section */}
        <div className="mb-8 w-full relative p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg backdrop-blur">
          <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
            {avatar !== null ? (
              <img
                src={raccoonAvatars[avatar]}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}

            <Pencil
              size={18}
              onClick={() => setOpenAvatar(true)}
              className="
                absolute
                -right-1
                -bottom-1
                p-1
                w-6
                h-6
                rounded-full
                bg-slate-700
                text-slate-200
                cursor-pointer
                hover:bg-purple-600
                transition
              "
            />
          </div>
          <p className="text-2xl text-center font-bold text-slate-100">
            {displayName}
          </p>

          <div className="flex gap-3 justify-center relative">
            {handle && (
              <>
                <p className="text-slate-500">@{handle}</p>
                <Pencil
                  onClick={() => {
                    setOpenHandleModal(true);
                    setNewHandle(handle);
                    setMessage("");
                  }}
                  className="text-slate-500 mt-1 cursor-pointer absolute right-5"
                  size={16}
                />
              </>
            )}
          </div>

          <div className="flex justify-between 
            text-sm font-bold font-semibold text-purple-500"
            >
              <div className="flex flex-col items-center">
                <p>Following</p>
                <p>{following ?? 0}</p>
              </div>
              <div className="flex flex-col items-center">
                <p>Followers</p>
                <p>{followers ?? 0}</p>
              </div>
              <div className="flex flex-col items-center">
                <p>Friends</p>
                <p>{friends ?? 0}</p>
              </div>
            </div>

          {bio ? (
            <p className="text-xs text-center mt-2 px-1">
              {bio}
            </p>
          ) : (
            <p className="text-xs text-center mt-2 px-1">
              This user hasn't created a bio yet.
            </p>
          )}

          {/* <p className="text-center text-sm text-blue-700 break-all">
            Joined{" "}
            {user?.metadata?.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString()
              : "N/A"}
          </p> */}

          <div className="mt-2 grid grid-cols-1 gap-3">
            {/* <label className="text-xs text-center pl-2 uppercase tracking-wider text-slate-400 font-semibold">
              Status
            </label> */}

            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="
                py-3 bg-black/50 border px-5
                border-slate-600 rounded-xl text-white 
                focus:outline-none focus:border-purple-500"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                  className="text-start"
                >
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Personal Card */}
        {(sex || relationship || employment || birthday || country) && (
          <div className="
                space-y-3 p-2 rounded-xl border border-slate-700/50 
                bg-gradient-to-br from-black via-zinc-950 to-zinc-800 
                p-3 transition hover:border-purple-500 mb-8 ">
            {personalInfo.map((info) => {
              const Icon = info.icon;

              return (
                <div
                  key={info.label}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 transition hover:bg-slate-700/40"
                >
                  <p className="relative mb-1 flex text-xs font-medium uppercase tracking-wider text-slate-500">
                    {info.label}

                    <Icon
                      size={16}
                      className="absolute right-0"
                    />
                  </p>

                  <p className="break-words text-sm font-semibold text-slate-200">
                    {info.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Social Links Section */}
        {socialLinks.length > 0 && (
          <div className="w-full mb-8 rounded-lg border border-slate-700 bg-gradient-to-br from-black via-zinc-950 to-zinc-800 p-8 transition-all hover:border-purple-500">
            <h2 className="mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-xl font-bold text-transparent">
              Social Account
            </h2>

            <div className="space-y-3">
              {socialLinks.map((social, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-700 p-4"
                >
                  <h3 className="text-lg font-semibold text-purple-400">
                    {social.title}
                  </h3>

                  <a
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-slate-400 hover:text-purple-300"
                  >
                    {social.link}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Open Avatar-Box Modal */}
      {openAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className=" w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-800 p-4 sm:p-6 shadow-2xl ">
            <h2 className="mb-5 sm:mb-6 text-lg sm:text-xl font-semibold text-white">
              Choose your avatar
            </h2>
            {/* Avatar Cards */}
            <div className=" grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 ">
              {raccoonAvatars.slice(0, user?.email === 'chheang097kim@gmail.com' ? 13 : 10).map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedAvatar(index)}
                  className={` rounded-xl border-2 p-1 transition 
                    ${
                      selectedAvatar === index
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-transparent hover:border-purple-500 hover:bg-gray-700"
                    } `}
                >
                  <img
                    src={avatar}
                    alt={`Raccoon avatar ${index + 1}`}
                    className=" w-full aspect-square rounded-xl object-cover "
                  />
                </button>
              ))}
            </div>
            {/* Buttons */}
            <div className="mt-5 sm:mt-6 flex justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedAvatar(avatar);
                  setOpenAvatar(false);
                }}
                className=" rounded-lg bg-gray-700 px-4 py-2 text-sm sm:text-base text-white hover:bg-gray-600 "
              >
                {" "}
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAvatar}
                className=" rounded-lg bg-purple-600 px-4 py-2 text-sm sm:text-base text-white hover:bg-purple-500 "
              >
                {" "}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------ */}
      <main
        className="
          flex-1
          min-w-0
          h-screen
          flex
          flex-col
          bg-black
          overflow-hidden
        "
      >
        {/* Tab Navigation */}
        <div
          className="
          flex
          gap-2 sm:gap-4
          px-3 sm:px-5
          pt-3 sm:pt-5
          pb-3 sm:pb-4
          border-b border-slate-700
          bg-black/50
          flex-shrink-0
          sticky top-0 z-10
        "
        >
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden top-4 left-4 z-40
                      p-2 rounded-lg
                      bg-slate-800 text-white
                      hover:bg-slate-700"
          >
            ☰
          </button>

          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 sm:px-4
                py-2
                text-sm sm:text-base
                font-small
                transition-all
                rounded-t-lg
                whitespace-nowrap

                ${
                  activeTab === tab.id
                    ? " text-white "
                    : "text-slate-400 hover:text-slate-200"
                }
              `}
            >
              {tab.label}
            </button>
          ))}

          {/* Profile Icon and Menu */}
          <div
            className="ml-auto flex items-center gap-4 cursor-pointer"
            onClick={() => setRightMenu()}
          >
            <div className="relative">
              {avatar !== null ? (
                <img
                  src={raccoonAvatars[avatar]}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-2xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {openProfileMenu && (
            <div
              className="
                  absolute top-15 right-5 items-center 
                  bg-black border border-slate-700 
                  rounded-lg shadow-lg p-2 z-50 px-4 grid"
            >
              <h2 className="text-center pb-1 border-b border-slate-400">
                {displayName}
              </h2>
              {profileItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  (item.id === "home" && location.pathname === "/home") ||
                  (item.id === "profile" &&
                    location.pathname === "/home/profile") ||
                  (item.id === "settings" &&
                    location.pathname === "/home/settings");

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(
                        item.id === "home"
                          ? "/home"
                          : item.id === "profile"
                            ? "/home/profile"
                            : item.id === "settings"
                              ? "/home/settings"
                              : "/home",
                      );
                      setOpenProfileMenu(false);
                    }}
                    className={`
                          block flex gap-2 w-full
                          text-left px-4 py-2 rounded 
                          transition-all duration-300 
                          font-medium ${
                            isActive
                              ? "text-white shadow-lg"
                              : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                          }`}
                  >
                    <Icon />
                    {item.label}
                  </button>
                );
              })}
              {/* Sign Out Button */}
              <button
                onClick={async () => {
                  setIsOpenedLogout(true);
                }}
                className="block flex gap-2 w-full
                          text-left px-4 py-2 rounded 
                          transition-all duration-300 
                          font-medium
                          text-red-400 hover:text-red-300"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Content Area - Scrollable */}
        <div
          className="
            flex-1
            min-w-0
            overflow-y-auto
            p-3
            sm:p-4
            md:p-6
            lg:p-10
          
          "
        >
          {activeTab === "overview" && <ProfileOverview />}
          {/* {activeTab === "details" && <AccountDetails />} */}
        </div>
      </main>

      {openHandleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[300px] h-[250px] bg-black border border-slate-700 rounded-2xl shadow-2xl p-8">
            <h2 className="text-center text-white font-semibold text-xl py-2">
              Edit Handle
            </h2>
            {message && (
              <p className="text-red-500 font-semibold text-center pb-2">
                {message}
              </p>
            )}
            <input
              value={newHandle}
              type="text"
              minLength={3}
              maxLength={25}
              placeholder={handle}
              onChange={(e) => setNewHandle(e.target.value)}
              className={`w-full p-2 text-white ${
                newHandle.length >= 15 ? "text-sm" : "text-base"
              } border font-semibold rounded-2xl hover:bg-gray-700`}
            />

            <div className="justify-between flex">
              <button
                type="button"
                onClick={() => {
                  setOpenHandleModal(false);
                }}
                className="mt-6 px-4 py-2 border hover:bg-gray-700 text-white rounded-lg"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  handleUpdateHandle();
                }}
                className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
              >
                Save & Change
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpenedLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">

          {/* Modal */}
          <div className="w-[90%] max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">

            {/* Icon */}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <LogOut size={24} />
            </div>

            {/* Text */}
            <h2 className="text-xl font-semibold text-white">
              Log out of Raccoon?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to log out? You'll need to sign in again
              to continue using Raccoon.
            </p>

            {/* Buttons */}
            <div className="mt-7 flex justify-end gap-3">

              <button
                onClick={() => setIsOpenedLogout(false)}
                className="
                  rounded-xl px-5 py-2.5
                  text-sm font-medium text-slate-300
                  transition
                  hover:bg-slate-800 hover:text-white
                  cursor-pointer
                "
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    await auth.signOut();
                    navigate("/landingpage/login");
                  } catch (error) {
                    console.error("Error signing out:", error);
                  }
                }}
                className="
                  rounded-xl bg-red-500 px-5 py-2.5
                  text-sm font-semibold text-white
                  shadow-lg shadow-red-500/20
                  transition
                  hover:bg-red-600
                  active:scale-95
                  cursor-pointer
                "
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}