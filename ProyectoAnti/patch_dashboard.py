import re

with open('src/pages/dashboard.astro', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("const sectionsRes = await fetch('/api/videos/sections');")
end_idx = content.find("if (sectionsData && sectionsData.sections) {")

if start_idx != -1:
    old_code = content[start_idx:end_idx]
    
    new_code = """const sectionsRes = await fetch('/api/videos/sections');
      const sectionsData = await sectionsRes.json();

      const mainSections = sectionsData.sections ? sectionsData.sections.filter(s => !s.parent_id) : [];
      const subSections = sectionsData.sections ? sectionsData.sections.filter(s => s.parent_id) : [];

      async function buildGalleryHtml(section, isSub = false) {
        const videosRes = await fetch('/api/videos/upload?section_id=' + section.id);
        const videosData = await videosRes.json();
        const videos = videosData.videos || [];
        
        const children = subSections.filter(s => s.parent_id === section.id);
        
        if (videos.length === 0 && children.length === 0) return '';
        
        let sh = '';
        const margin = isSub ? 'ml-6 mt-4 pl-4 border-l-2 border-blue-500/30' : 'mt-8';
        const titleClass = isSub ? 'text-lg font-bold text-slate-800 dark:text-slate-200 mb-3' : 'text-2xl font-bold text-[#06203D] dark:text-white mb-4';
        const icon = isSub ? '↳ ' : '📚 ';

        sh += `<div class="${margin}">`;
        sh += `<h3 class="${titleClass}">${icon} ${section.title}</h3>`;
        if (section.description) {
            sh += `<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${section.description}</p>`;
        }
        
        if (videos.length > 0) {
            sh += '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">';
            videos.forEach(video => {
                const thumb = getThumbnailUrl(video.video_url, video.thumbnail_url) || 'https://via.placeholder.com/640x360.png?text=Video';
                const jsonVideo = JSON.stringify(video).replace(/'/g, "&apos;").replace(/"/g, '&quot;');
                sh += `
                <div class="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col cursor-pointer transform hover:-translate-y-1 play-trigger" data-video='${jsonVideo}'>
                    <div class="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img src="${thumb}" alt="${video.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div class="bg-white/90 dark:bg-slate-800/90 w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                                <svg class="w-6 h-6 text-[#0073CF] dark:text-[#3399ff] ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div class="p-5 flex-1 flex flex-col">
                        <h4 class="font-bold text-[#06203D] dark:text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-[#0073CF] dark:group-hover:text-[#3399ff] transition-colors">${video.title}</h4>
                        ${video.description ? `<p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-auto">${video.description}</p>` : ''}
                    </div>
                </div>`;
            });
            sh += '</div>';
        }

        for (const child of children) {
            sh += await buildGalleryHtml(child, true);
        }

        sh += '</div>';
        return sh;
      }

      if (mainSections.length > 0) {
        let html = '';
        for (const section of mainSections) {
            html += await buildGalleryHtml(section, false);
        }
        galleryContainer.innerHTML = html || '<div class="text-center py-20"><p class="text-slate-500 dark:text-slate-400">No hay videos publicados todavía.</p></div>';
      } else {
        galleryContainer.innerHTML = '<div class="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800"><div class="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-blue-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></div><h3 class="text-xl font-bold text-[#06203D] dark:text-white mb-2">Aún no hay contenido</h3><p class="text-slate-500 dark:text-slate-400">Los videos aparecerán aquí cuando sean publicados.</p></div>';
      }
      
      // Bind play triggers again
      document.querySelectorAll('.play-trigger').forEach(el => {
        el.addEventListener('click', () => {
          const video = JSON.parse(el.getAttribute('data-video'));
          openModal(video);
        });
      });
    } catch (error) {
"""
    
    # We will just replace the whole fetching loop block in dashboard.astro
    # Find the end of the original loop
    end_try_idx = content.find("} catch (error) {", start_idx)
    
    content = content[:start_idx] + new_code + content[end_try_idx+17:]
    
    with open('src/pages/dashboard.astro', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched dashboard.astro successfully")
else:
    print("Could not find target in dashboard")
