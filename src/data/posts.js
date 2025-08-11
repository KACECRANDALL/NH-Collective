// Import the marked library for parsing Markdown
import { marked } from 'marked'

// Placeholder: List your Google Drive file IDs here
const googleDriveFileIds = [
	// Example: '1A2B3C4D5E6F7G8H9I0J',
]
// Helper to get raw download URL for a Google Drive file
function getDriveRawUrl(fileId) {
	return `https://drive.google.com/uc?id=${fileId}&export=download`
}

export async function listPosts() {
	const posts = await Promise.all(
		googleDriveFileIds.map(async (id) => {
			const res = await fetch(getDriveRawUrl(id))
			const raw = await res.text()
			// Simple frontmatter split (replace with your parseFrontMatter if needed)
			const m = raw.match(/^---\s*[\r\n]+([\s\S]*?)\s*[\r\n]+---\s*[\r\n]?([\s\S]*)$/)
			let data = {}, content = raw
			if (m) {
				try { data = JSON.parse(m[1]) } catch {}
				content = m[2]
			}
			return {
				slug: id,
				title: data.title || 'Untitled',
				date: data.date || '',
				tags: data.tags || [],
				excerpt: data.excerpt || content.slice(0,220) + '…',
				html: marked.parse(content || ''),
				content
			}
		})
	);
	return posts;
}

export async function getPostBySlug(slug) {
	const posts = await listPosts()
	return posts.find(p => p.slug === slug)
}

export async function getAllTags() {
	const posts = await listPosts()
	const set = new Set()
	posts.forEach(p => (p.tags||[]).forEach(t => set.add(t)))
	return Array.from(set).sort()
}
  
