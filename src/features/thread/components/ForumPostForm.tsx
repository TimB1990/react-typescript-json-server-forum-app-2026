import { useState } from "react"
import { RichTextEditor } from "../../../common/components/ui/richTextEditor/RichTextEditor"
import { Card } from "../../../common/components/ui/cards/Card"

export const ForumPostForm: React.FC<{ userId: number }> = ({ userId }) => {

    const [editorContent, setEditorContent] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!editorContent.trim() || editorContent === '<br>') {
            // TODO show as decent error
            alert('Please enter a message before submitting (this will be shown as decent error later)')
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
                    userId: userId,
                    content: editorContent, // raw HTML
                    createdAt: new Date().toISOString()
                })
            })

            if (response.ok) {
                setEditorContent('')

                // show as decent message
                alert('Reply posted successfully!');
            }

        } catch (error) {
            // show as decent message
            console.error('Error posting reply:', error)
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container full-width">
            <form onSubmit={handleSubmit}>
                <Card
                    header={<h2>Join the conversation</h2>}
                    content={
                        <div className="message-editor">
                            <RichTextEditor
                                value={editorContent}
                                onChange={setEditorContent}
                                placeholder="Write your forum reply..."
                            />
                        </div>
                    }
                    footer={
                        <div style={{display: 'flex', justifyContent: 'flex-end', padding: 'clamp(1em, 2vw, 1.25em)'}}>
                            <button className="btn-default orange" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                            </button>
                        </div>
                    }
                    options={{ divided: { top: false, bottom: false } }}
                />
            </form>
        </div>
    )
}
