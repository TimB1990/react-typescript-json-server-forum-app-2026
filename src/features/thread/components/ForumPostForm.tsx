import React, { useState, forwardRef } from "react"
import { RichTextEditor } from "../../../common/components/ui/richTextEditor/RichTextEditor"
import { Card } from "../../../common/components/ui/cards/Card"
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface ForumPostFormProps {
  flash: boolean;
  editorContent: string;
  setEditorContent: React.Dispatch<React.SetStateAction<string>>;
}

export const ForumPostForm = forwardRef<HTMLDivElement, ForumPostFormProps>(({
  flash,
  editorContent,
  setEditorContent
}, ref) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { user } = useAuth();
  
  // Safely check if logged in
  const isLoggedIn = Boolean(user && user.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorContent.trim() || editorContent === '<br>') {
      alert('Please enter a message before submitting')
      return;
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:5001/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user?.id,
          content: editorContent, // raw HTML
          createdAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        setEditorContent('')
        alert('Reply posted successfully!');
      }

    } catch (error) {
      console.error('Error posting reply:', error)
    }
    finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div id="editor" ref={ref} className={`container full-width ${flash ? 'flash-border' : ''}`}>
      <form onSubmit={handleSubmit}>
        <Card
          header={<h2>Join the conversation</h2>}
          content={
            <div className="message-editor">
              {isLoggedIn ? (
                <RichTextEditor
                  value={editorContent}
                  onChange={setEditorContent}
                  placeholder="Write your forum reply..."
                />
              ) : (
                <>
                  If you want to join this conversation you need to be logged in.
                  <br />
                  Already have an account? <Link to="/login"><strong><u>Login</u></strong></Link>
                  <br />
                  No account yet? <Link to="/register"><strong><u>Register</u></strong></Link>
                </>
              )}
            </div>
          }
          footer={
            isLoggedIn && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'clamp(1em, 2vw, 1.25em)' }}>
                <button className="btn-default orange" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                </button>
              </div>
            )
          }
          options={{ divided: { top: false, bottom: false } }}
        />
      </form>
    </div>
  )
});

ForumPostForm.displayName = "ForumPostForm";