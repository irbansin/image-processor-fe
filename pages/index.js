import { useRef, useState } from 'react';

const ACCEPTED_TYPES = [
  'image/heic',
  'image/heif', 
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export default function Home() {
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const fileInputRef = useRef();

  const handleFiles = async (files) => {
    let newAccepted = [];
    let newRejected = [];
    let newFeedback = [];

    for (let file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        newRejected.push({
          file,
          reason: 'Unsupported file type',
        });
        newFeedback.push({
          name: file.name,
          status: 'Rejected',
          reason: 'Only HEIC, PNG, and JPEG formats are allowed.',
        });
        continue;
      }

      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      newAccepted.push({ file, previewUrl });
      newFeedback.push({
        name: file.name,
        status: 'Accepted',
        reason: 'Ready to upload',
      });

      // Upload to backend
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch('http://localhost:5000/api/images/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          newRejected.push({ file, reason: data.error || 'Upload failed' });
          newFeedback.push({
            name: file.name,
            status: 'Rejected',
            reason: data.error || 'Upload failed',
          });
          continue;
        }
        const data = await res.json();
        // Mark as uploaded successfully
        newFeedback.push({
          name: file.name,
          status: 'Accepted',
          reason: 'Uploaded successfully',
        });
        // Optionally store backend URL/data if needed
      } catch (err) {
        newRejected.push({ file, reason: 'Network or server error' });
        newFeedback.push({
          name: file.name,
          status: 'Rejected',
          reason: 'Network or server error',
        });
      }
    }

    setAccepted((prev) => [...prev, ...newAccepted]);
    setRejected((prev) => [...prev, ...newRejected]);
    setFeedback((prev) => [...prev, ...newFeedback]);
  };

  const onChange = (e) => {
    handleFiles(e.target.files);
    fileInputRef.current.value = '';
  };

  return (
    <div className="container">
      <h1>Image Uploader</h1>
      <input
        type="file"
        accept=".heic,.heif,.png,.jpeg,.jpg,image/heic,image/heif,image/png,image/jpeg,image/jpg"
        multiple
        onChange={onChange}
        ref={fileInputRef}
      />
      <div className="feedback">
        {feedback.map((fb, idx) => (
          <div key={idx} className={`feedback-item ${fb.status.toLowerCase()}`}>
            {fb.name}: {fb.status} {fb.reason && `- ${fb.reason}`}
          </div>
        ))}
      </div>
      <div className="sections">
        <div className="accepted">
          <h2>Accepted</h2>
          <div className="images">
            {accepted.map((item, idx) => (
              <div key={idx} className="image-preview">
                <img src={item.previewUrl} alt={item.file.name} />
                <span>{item.file.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rejected">
          <h2>Rejected</h2>
          <div className="images">
            {rejected.map((item, idx) => (
              <div key={idx} className="image-preview rejected">
                <span>{item.file.name}</span>
                <span className="reason">{item.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .container {
          max-width: 700px;
          margin: 2rem auto;
          padding: 2rem;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        h1 {
          text-align: center;
        }
        input[type='file'] {
          display: block;
          margin: 1rem auto;
        }
        .feedback {
          margin: 1rem 0;
        }
        .feedback-item {
          margin-bottom: 0.3rem;
        }
        .feedback-item.accepted {
          color: #2e7d32;
        }
        .feedback-item.rejected {
          color: #c62828;
        }
        .sections {
          display: flex;
          gap: 2rem;
        }
        .accepted, .rejected {
          flex: 1;
        }
        .images {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .image-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f5f5f5;
          border-radius: 6px;
          padding: 0.5rem;
        }
        .image-preview img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .image-preview.rejected {
          opacity: 0.7;
        }
        .reason {
          color: #c62828;
          margin-left: 1rem;
        }
      `}</style>
    </div>
  );
}
