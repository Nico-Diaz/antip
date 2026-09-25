const fs = require('fs');

let content = fs.readFileSync('src/pages/dashboard.astro', 'utf8');

const startStr = "if (!sectionsRes.ok || !sectionsData.sections || sectionsData.sections.length === 0) {";
const endStr = "mainSectionsContainer.innerHTML = html;";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newCode = `if (!sectionsRes.ok || !sectionsData.sections || sectionsData.sections.length === 0) {
          mainSectionsContainer.innerHTML = '<div class="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center transition-colors"><h3 class="text-lg font-bold text-[#06203D] dark:text-white mb-2">No hay contenidos publicados por el momento</h3><p class="text-slate-500 dark:text-slate-400 text-sm">Los videos publicados por la administración aparecerán aquí.</p></div>';
          return;
        }

        const mainSections = sectionsData.sections.filter(s => !s.parent_id);
        const subSections = sectionsData.sections.filter(s => s.parent_id);

        async function buildSectionHtml(section, isSub = false) {
          const videosRes = await fetch('/api/videos/upload?section_id=' + section.id);
          const videosData = await safeFetchJson(videosRes);
          const videos = videosData.videos || [];
          
          let completedInSection = 0;
          let videosHtml = '';

          if (videos.length > 0) {
            videosHtml += '<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">';
            videos.forEach(function(video) {
              const thumb = getThumbnailUrl(video.video_url, video.thumbnail_url);
              const jsonVideo = JSON.stringify(video).replace(/\\'/g, "&apos;").replace(/\\"/g, '&quot;');
              
              const progress = progressMap[video.id];
              let progressBadge = '';
              
              if (progress && progress.is_completed) {
                completedInSection++;
                progressBadge = '<div class="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-sm"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>Visto</div>';
              } else if (progress && progress.progress_seconds > 0) {
                progressBadge = '<div class="absolute bottom-0 left-0 h-1 bg-green-500 z-10" style="width: 50%"></div>';
              }

              videosHtml += '<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-800 group cursor-pointer play-trigger relative flex flex-col" data-video=\\'' + jsonVideo + '\\'>';
              videosHtml += progressBadge;
              
              videosHtml += '<div class="relative w-full aspect-video bg-slate-800 overflow-hidden">';
              if (thumb) {
                videosHtml += '<img src="' + thumb + '" alt="' + video.title + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />';
              }
              videosHtml += '<div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>';
              videosHtml += '<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><div class="bg-white/90 dark:bg-slate-800/90 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"><svg class="w-5 h-5 text-[#0073CF] dark:text-[#3399ff] ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg></div></div>';
              videosHtml += '</div>';

              videosHtml += '<div class="p-3 flex-1 flex flex-col">';
              videosHtml += '<h4 class="font-bold text-[#06203D] dark:text-slate-100 text-[13px] line-clamp-2 leading-tight group-hover:text-[#0073CF] dark:group-hover:text-[#3399ff] transition-colors">' + video.title + '</h4>';
              if (video.description) {
                videosHtml += '<p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">' + video.description + '</p>';
              }
              videosHtml += '</div></div>';
            });
            videosHtml += '</div>';
          }

          const children = subSections.filter(s => s.parent_id === section.id);
          
          if (videos.length === 0 && children.length === 0) return ''; // Skip empty modules

          const progressText = videos.length > 0 ? \`<span class="bg-blue-50 dark:bg-slate-800 text-[#0073CF] dark:text-[#3399ff] text-xs font-bold px-3 py-1 rounded-full border border-blue-100 dark:border-slate-700">\${completedInSection} / \${videos.length} Vistos</span>\` : '';

          const margin = isSub ? 'ml-6 mt-6 border-l-2 border-blue-300 dark:border-slate-700 pl-6' : '';
          const titlePrefix = isSub ? '↳ ' : '';
          
          let sh = '<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 transition-colors ' + margin + '">';
          
          sh += '<div class="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">';
          sh += '<div><h3 class="text-xl font-bold text-[#06203D] dark:text-white flex items-center gap-2">' + titlePrefix + section.title + '</h3>';
          if (section.description) {
            sh += '<p class="text-slate-500 dark:text-slate-400 text-sm mt-1">' + section.description + '</p>';
          }
          sh += '</div>';
          sh += '<div class="shrink-0">' + progressText + '</div></div>';
          
          if (videosHtml) {
             sh += videosHtml;
          } else {
             sh += '<p class="text-slate-400 dark:text-slate-500 text-sm italic bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-700">Sin videos directos.</p>';
          }

          for (const child of children) {
            sh += await buildSectionHtml(child, true);
          }

          sh += '</div>';
          return sh;
        }

        let html = '';
        for (const section of mainSections) {
          html += await buildSectionHtml(section, false);
        }

        `;

    content = content.substring(0, startIdx) + newCode + content.substring(endIdx);
    fs.writeFileSync('src/pages/dashboard.astro', content);
    console.log("Patched dashboard.astro");
} else {
    console.log("Could not find dashboard.astro target");
}
