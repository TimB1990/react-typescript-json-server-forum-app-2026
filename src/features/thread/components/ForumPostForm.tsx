import React, { useState, forwardRef } from "react"
import { RichTextEditor } from "../../../common/components/ui/richTextEditor/RichTextEditor"
import { Card } from "../../../common/components/ui/cards/Card"
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { sanitizeQuotesFromHTML } from "../../../common/utils/removeQuotesFromHTML";

interface ForumPostFormProps {
  flash: boolean;
  threadId: number;
  categoryId: number;
  editorContent: string;
  setEditorContent: React.Dispatch<React.SetStateAction<string>>;
  onSuccess?: (messageId: number) => void;
  onError?: (error: string) => void;
}

export const ForumPostForm = forwardRef<HTMLDivElement, ForumPostFormProps>(({
  flash,
  threadId,
  categoryId,
  editorContent,
  setEditorContent,
  onSuccess,
  onError
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

    const sanitizedHTML = sanitizeQuotesFromHTML(editorContent, threadId)
    const storedQuoteIds = sessionStorage.getItem(`quotes_thread_${threadId}`);

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
          threadId,
          categoryId,
          quoteIds: storedQuoteIds,
          content: sanitizedHTML,
          createdAt: new Date().toISOString()
        })
      })

      if (response.ok) {

        const data = await response.json();
        const newMessageId = data.id
        setEditorContent('')
        onSuccess?.(newMessageId)
        alert('Reply posted successfully!');
      }

    } catch (error: any) {
      onError?.(error)
      alert(`Error posting reply: ${error}`)
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