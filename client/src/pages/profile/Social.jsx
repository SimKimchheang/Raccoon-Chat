import { useState, useEffect, use } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";

export default function Social() {
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [socialLinks, setSocialLinks] = useState([]);
  const [edit, setEdit] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLink, setEditLink] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

      if (!currentUser) {
        setSocialLinks([]);
        return;
      }

      try {
        const userDoc = await getDoc(
          doc(db, "users", currentUser.uid)
        );

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSocialLinks(userData.socialLinks || []);
        }

      } catch (error) {
        console.error("Error fetching social links:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreate = async() => {
    setMessage('');
    setMessageType('');
    const currentUser = auth.currentUser;

    if (!auth.currentUser) {
      console.log('You must be logged in.');
      return;
    }

    if (!title.trim() || !link.trim()) {
      console.log("Title and Link are required");
      setMessage('Title and Link are required')
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);

      const userSnap = await getDoc(userRef);
      const existingLinks = userSnap.exists()
        ? userSnap.data().socialLinks || []
        : [];
      
      const newLink = {
        title: title.trim(),
        link: link.trim()
      };

      await setDoc(
        userRef,
        {
          socialLinks: [...existingLinks, newLink]
        },
        {merge: true}
      );
      setSocialLinks(prev => [...prev, newLink]);

      setMessage("Social link created!");
      setMessageType('success');

      setTitle('');
      setLink('');
      setShowCreateForm(false);
    } catch (error) {
      console.log('Failed to create social link:', error);
      setMessage(error)
    }
  }

  const handleSaveEdit = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser || edit === null) return;

    const updatedLinks = [...socialLinks];

    updatedLinks[edit] = {
      title: editTitle.trim(),
      link: editLink.trim()
    };

    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          socialLinks: updatedLinks
        },
        { merge: true }
      );

      setSocialLinks(updatedLinks);
      setEdit(null);

      setMessage("Social link updated!");
      setMessageType("success");

    } catch (error) {
      console.error("Failed to update:", error);
    }
  }; 
  
  const handleDelete = async (index) => {
    const currentUser = auth.currentUser;
    if(!currentUser) return;
    try {
      const updateLinks = socialLinks.filter(
        (_, i) => i !== index
      );
      await setDoc(
        doc(db, "users", currentUser.uid), 
        {
          socialLinks: updateLinks
        },
        { merge: true }
      );
      setSocialLinks(updateLinks);
      setMessage("Social link deleted");
      setMessageType('success');
    } catch (error) {
      console.log("Failed to delete social link:, error");
    };
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-slate-400">
          Create and paste links here to let people know your other social
          medias
        </p>
      </div>

      <div>
        {!showCreateForm ? (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className=" px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors"
          >
            Create +
          </button>
        ) : (
          <div className="mt-4 space-y-3 relative bg-gray-900/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
            {message && (
              <p
                className={`py-2 border text-center rounded-xl ${
                  messageType === "success"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}            
            <div>
              <p className="text-xl text-purple-400 pb-4">Title</p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Something..."
                className="w-full rounded-xl border border-gray-600 bg-gray-800/50 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500"
              />

              <p className="text-xl text-purple-400 py-4">Link</p>
              <input 
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://myaccountlink"
                className="w-full rounded-xl border border-gray-600 bg-gray-800/50 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500"
                />
            </div>

            <div className="flex gap-4 relative">
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 my-4">
        {socialLinks.map((social, index) => (
          <div
            key={index}
            className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl"
          >
            <div className="flex items-center justify-between gap-4">

              {/* Social information */}
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-purple-400">
                  {social.title}
                </h3>

                <a
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-purple-300 break-all"
                >
                  {social.link}
                </a>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => {
                    setEdit(index);
                    setEditTitle(social.title);
                    setEditLink(social.link);
                    }
                  }
                  title="Edit"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <Pencil size={18} />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  title="Delete"
                  onClick={() => handleDelete(index)}
                  className="p-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>
          </div>
        ))}
      </div>

      {edit !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

          {/* Modal */}
          <div className="w-[400px] bg-gradient-to-br from-black via-zinc-950 to-zinc-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">

            <h2 className="text-2xl font-bold text-purple-400 mb-6">
              Edit Social Link
            </h2>

            {/* Title */}
            <p className="text-slate-400 mb-2">
              Title
            </p>

            <input
              type="text"
              value={editTitle}
              onChange={(e) => {setEditTitle(e.target.value)}}
              className="w-full rounded-xl bg-gray-700/50 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Link */}
            <p className="text-slate-400 mt-4 mb-2">
              Link
            </p>

            <input
              type="text"
              value={editLink}
              onChange={(e) => {setEditLink(e.target.value)}}
              className="w-full rounded-xl bg-gray-700/50 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() => setEdit(null)}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"
              >
                Update
              </button>

            </div>

          </div>
        </div>
      )}      

    </div>
  );
}
