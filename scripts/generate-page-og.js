import { join } from 'pathe';
import { generateOGImage } from './og';
async function generatePageOGImages() {
    console.log('🎨 Generating page-level OG images...');
    const pages = [
        { title: 'Blog', filename: 'blog.png' },
        { title: 'Posts', filename: 'posts.png' },
        { title: 'Projects', filename: 'projects.png' },
        { title: 'Media', filename: 'media.png' },
        { title: 'Chat with pi-dal', filename: 'chat.png' },
        { title: 'pi-dal\'s Website', filename: 'og.png' },
    ];
    const ogDir = join(process.cwd(), 'public', 'og');
    for (const page of pages) {
        console.log(`🎨 Generating: ${page.title} → ${page.filename}`);
        try {
            const outputPath = join(ogDir, page.filename);
            await generateOGImage({
                title: page.title,
                author: 'pi-dal',
            }, outputPath);
            console.log(`✅ Generated: ${page.filename}`);
        }
        catch (error) {
            console.error(`❌ Failed to generate ${page.filename}:`, error);
        }
    }
    console.log('🎉 Page OG generation completed!');
}
generatePageOGImages().catch(console.error);
