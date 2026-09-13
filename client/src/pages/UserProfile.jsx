import { useEffect, useState, } from "react";
import { useLocation, useNavigate, useParams, Outlet, replace } from "react-router-dom";
import {
  setDoc,
  doc,
  getDoc,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { Eye, EyeClosed } from "lucide-react";

import raccoon1Img from "../assets/raccoon1.png";
import raccoon2Img from "../assets/raccoon2.png";
import raccoon3Img from "../assets/raccoon3.png";
import raccoon4Img from "../assets/raccoon4.png";
import raccoon5Img from "../assets/raccoon5.png";
import raccoon6Img from "../assets/raccoon6.png";
import raccoon7Img from "../assets/raccoon7.png";
import raccoon8Img from "../assets/raccoon8.png";
import raccoon9Img from "../assets/raccoon9.png";
import raccoon10Img from "../assets/raccoon10.png";
import raccoonForAdminImg1 from "../assets/raccoonForAdmin1.png";
import raccoonForAdminImg2 from "../assets/raccoonForAdmin2.png";
import raccoonForAdminImg3 from "../assets/raccoonForAdmin3.png";

export default function UserProfile() {
  const { uid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isChatRoute = location.pathname.endsWith("/chatMessage");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [friends, setFriends] = useState(0);

  const [isOpenedChatMessage, setIsOpenedChatMessage] = useState(true);

  const isOwnProfile = auth.currentUser?.uid === uid;

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

  const refreshProfile = async () => {
    if (!uid) return;

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser(userData);
        setFollowers(userData.followersCount ?? 0);
        setFollowing(userData.followingCount ?? 0);
        setFriends(userData.friendsCount ?? 0);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  // Fetch profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);
          setFollowers(userData.followersCount ?? 0);
          setFollowing(userData.followingCount ?? 0);
          setFriends(userData.friendsCount ?? 0);
          setIsOpenedChatMessage(true);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid]);

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("No logged-in user");
        return;
      }

      if (currentUser.uid === uid) {
        console.log("Viewing own profile");
        return;
      }

      try {
        const followRef = doc(db, "users", currentUser.uid, "following", uid);

        const followBackRef = doc(
          db,
          "users",
          uid,
          "following",
          currentUser.uid,
        );

        const followSnap = await getDoc(followRef);
        const followBackSnap = await getDoc(followBackRef);

        setIsFollowed(followSnap.exists());

        setIsFriend(followSnap.exists() && followBackSnap.exists());
      } catch (error) {
        console.log("Error checking follow status:", error);
      }
    };
    checkFollowStatus();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-slate-400">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-slate-400">
        User not found.
      </div>
    );
  }

  const displayName = user.username || "User";

  const handleFollow = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("You must be logged in.");
      return;
    }

    if (currentUser.uid === uid) {
      console.log("You cannot follow yourself.");
      return;
    }

    try {
      const batch = writeBatch(db);

      const followingRef = doc(db, "users", currentUser.uid, "following", uid);

      const followerRef = doc(db, "users", uid, "followers", currentUser.uid);

      const followBackRef = doc(
        db,
        "users",
        uid,
        "following",
        currentUser.uid,
      );

      const followingSnap = await getDoc(doc(db, "users", uid));
      const email = followingSnap.exists()
        ? followingSnap.data().email || ""
        : "";
      console.log("OTHER USER SNAPSHOT:", followingSnap.exists());
      console.log("OTHER USER DATA:", followingSnap.data());
      console.log("EMAIL WE GOT:", email || "No email found");

      if (!isFollowed) {
        // FOLLOW

        console.log("AUTH UID:", currentUser.uid);
        console.log("PROFILE UID:", uid);
        console.log("SAME USER?:", currentUser.uid === uid);
        console.log("FOLLOWING PATH:", `users/${currentUser.uid}/following/${uid}`);

        console.log("1️⃣ Creating following document...");

        await setDoc(followingRef, {
          uid: uid,
          username: user.username || "User",
          email: email || "",
          createdAt: new Date(),
        });

        console.log("✅ Following document created");

        console.log("2️⃣ Creating follower document...");

        const followerBatch = writeBatch(db);

        followerBatch.set(followerRef, {
          uid: currentUser.uid,
          username: currentUser.displayName || "User",
          email: currentUser.email || "",
          createdAt: new Date(),
        });

        await followerBatch.commit();

        console.log("✅ Follower document created");

        console.log("3️⃣ Updating MY followingCount...");

        const myCountBatch = writeBatch(db);

        myCountBatch.update(doc(db, "users", currentUser.uid), {
          followingCount: increment(1),
        });

        await myCountBatch.commit();

        console.log("✅ MY followingCount updated");

        console.log("4️⃣ Updating THEIR followersCount...");

        const theirCountBatch = writeBatch(db);

        theirCountBatch.update(doc(db, "users", uid), {
          followersCount: increment(1),
        });

        await theirCountBatch.commit();

        console.log("🔥 THEIR followersCount updated");

        setIsFollowed(true);

        await refreshProfile();

        // My friendship logic
        // Check if we follow each other.
        try {
          console.log("Checking friendship status...");

          const followingSnap = await getDoc(followingRef);
          console.log("Following read OK:", followingSnap.exists());

          const followBackSnap = await getDoc(followBackRef);
          console.log("Follow-back read OK:", followBackSnap.exists());

          if (followingSnap.exists() && followBackSnap.exists()) {
            setIsFriend(true);
            console.log("Updating MY friendsCount...");

            const myFriendBatch = writeBatch(db);

            myFriendBatch.update(doc(db, "users", currentUser.uid), {
              friendsCount: increment(1),
            });

            await myFriendBatch.commit();

            console.log("✅ MY friendsCount updated");

            console.log("Updating THEIR friendsCount...");

            const theirFriendBatch = writeBatch(db);

            theirFriendBatch.update(doc(db, "users", uid), {
              friendsCount: increment(1),
            });

            await theirFriendBatch.commit();

            console.log("🔥 THEIR friendsCount updated");
          } else {
            setIsFriend(false);
            console.log("Following only");
            // FriendsCount is preserved
          }
        } catch (err) {
          console.error("Friendship check error:", err);
        }

        await refreshProfile();
      } else {
        // UNFOLLOW

        batch.delete(followingRef);
        batch.delete(followerRef);

        batch.update(doc(db, "users", currentUser.uid), {
          followingCount: increment(-1),
        });

        batch.update(doc(db, "users", uid), {
          followersCount: increment(-1),
        });

        await batch.commit();

        setIsFollowed(false);

        // Check if we are friends
        try {
          if (isFriend) {
            setIsFriend(false);

            console.log("Decreasing MY friendsCount...");

            const myFriendBatch = writeBatch(db);

            myFriendBatch.update(doc(db, "users", currentUser.uid), {
              friendsCount: increment(-1),
            });

            await myFriendBatch.commit();

            console.log("✅ MY friendsCount decreased");

            console.log("Decreasing THEIR friendsCount...");

            const theirFriendBatch = writeBatch(db);

            theirFriendBatch.update(doc(db, "users", uid), {
              friendsCount: increment(-1),
            });

            await theirFriendBatch.commit();

            console.log("🔥 THEIR friendsCount decreased");

            console.log("Friendship ended", currentUser.uid, "💔", uid);
          }
        } catch (err) {
          console.error("Friendship end error:", err);
        }

        await refreshProfile();
      }
    } catch (err) {
      console.log(isFriend, "isFriend");
      console.error("Follow error:", err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-black ">

      {/* Profile panel */}
      <aside
          className={`
          ${isChatRoute ? "hidden lg:block" : ""}
          w-full
          lg:w-[400px]
          lg:min-w-[400px]
          h-screen
          flex-none
          pb-10
          bg-black
          text-white
          overflow-y-auto
          thin-scrollbar
          `}
      >
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-purple-900 via-slate-900 to-pink-900" />

        {/* Profile content */}
        <div className="mx-auto max-w-3xl px-6 pb-10">

          {/* Avatar */}
          <div className="-mt-16">
            {user.avatar !== null && user.avatar !== undefined ? (
              <img
                src={raccoonAvatars[user.avatar]}
                alt={displayName}
                className="h-32 w-32 rounded-full border-4 border-black object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-black bg-gradient-to-br from-purple-400 to-pink-600 text-5xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + handle */}
          <div className="mt-4">
            <h1 className="text-3xl font-bold">
              {displayName}
            </h1>

            {user.handle && (
              <p className="text-slate-500">
                @{user.handle}
              </p>
            )}
          </div>

          {/* Stats */}
          <div
            className="
              flex justify-between
              mt-4 px-4
              text-md font-bold
            "
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

          {/* Bio */}
          {user.bio && (
            <p className="mt-5 max-w-xl text-slate-300">
              {user.bio}
            </p>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            {!isOwnProfile && (
              <>
                {(!isOpenedChatMessage || window.innerWidth < 1024 ) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpenedChatMessage(true);
                      navigate(`/home/profile/${uid}/chatMessage`), {replace: true};
                      }
                    }
                    className="
                      rounded-xl
                      bg-white 
                      px-5 py-2.5 
                      font-semibold
                      text-black grid
                      transition relative
                      hover:bg-slate-200
                    "
                  >
                    Message 
                    <EyeClosed
                      size={25} 
                      strokeWidth={2} 
                      className={`${(window.innerWidth <= 1024) && 'hidden'} text-purple-500 absolute left-21 bottom-8 bg-black rounded-full p-1`}
                    />
                  </button>
                ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpenedChatMessage(false);
                          navigate(`/home/profile/${uid}/chatMessage`), {replace: true};
                          }
                        } 
                        className="
                          rounded-xl items-center
                          bg-white text-sm
                          px-5 py-2.5 
                          font-semibold
                          text-black grid
                          transition relative
                          hover:bg-slate-200
                        "
                      >
                        Hide Chat
                        <Eye
                          size={25} 
                          strokeWidth={2} 
                          className={`${(window.innerWidth <= 1024) && 'hidden'} text-purple-500 absolute left-21 bottom-8 bg-black rounded-full p-1`}
                        />
                      </button>
                    )
                  }

                <button
                  type="button"
                  onClick={handleFollow}
                  className="
                    rounded-xl
                    border border-slate-700
                    px-5 py-2.5
                    font-semibold
                    text-white
                    transition
                    hover:bg-slate-900
                  "
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              </>
            )}
          </div>

          {/* Information */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            {user.status && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-1 font-medium">{user.status}</p>
              </div>
            )}

            {user.country && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-500">Country</p>
                <p className="mt-1 font-medium">{user.country}</p>
              </div>
            )}

            {user.sex && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-500">Sex</p>
                <p className="mt-1 font-medium">{user.sex}</p>
              </div>
            )}

            {user.employment && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-500">Employment</p>
                <p className="mt-1 font-medium">{user.employment}</p>
              </div>
            )}

          </div>
        </div>
      </aside>

      {/* Chat / Outlet panel */}
      <main
        className={`
          ${isChatRoute ? "flex" : "hidden lg:flex"}
          flex-1
          min-w-0
          h-screen py-4
          bg-slate-950
          text-white
          overflow-hidden
        `}
      > 
        {isOpenedChatMessage && (
          <Outlet />
        )}
      </main>

    </div>
  );
}
