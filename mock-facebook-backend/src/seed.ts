import { prisma } from './prisma';

export async function seedDatabase() {
  console.log('[Seeder] Resetting database tables...');

  // Delete in proper relational order
  await prisma.webhookLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seeder] Seeding 36 authentic Sri Lankan Sinhala users...');

  const rawUsers = [
    { id: 'user-me', name: 'කසුන් පෙරේරා', handle: 'kasun_p', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-1', name: 'ඩිලාන් ප්‍රනාන්දු', handle: 'dilan_f', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-2', name: 'නෙත්මි සිල්වා', handle: 'nethmi_s', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-3', name: 'ඉසුරු විජේසිංහ', handle: 'isuru_w', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-4', name: 'චතුරිකා ලක්මාලි', handle: 'chathu_l', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-5', name: 'සචින්ත මධුශංක', handle: 'sachintha_m', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-6', name: 'තාරක ජයවර්ධන', handle: 'tharaka_j', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-7', name: 'පබසරී ආරියරත්න', handle: 'pabasari_a', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-8', name: 'කවිඳු මධුෂාන්', handle: 'kavindu_m', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-9', name: 'සඳුනි ගමගේ', handle: 'sanduni_g', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-10', name: 'රවිඳු හේමන්ත', handle: 'ravindu_h', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-11', name: 'හිරුෂි වික්‍රමසිංහ', handle: 'hirushi_w', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-12', name: 'ප්‍රමෝද් කරුණාරත්න', handle: 'pramod_k', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-13', name: 'මල්කි සමරනායක', handle: 'malki_s', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-14', name: 'ලසිත් දේශප්‍රිය', handle: 'lasith_d', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-15', name: 'දිනුෂා ගුණතිලක', handle: 'dinusha_g', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-16', name: 'නිරෝෂන් රත්නායක', handle: 'niroshan_r', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-17', name: 'ඕෂධී සෙනෙවිරත්න', handle: 'oshadhi_s', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-18', name: 'චමිඳු කෞෂල්‍ය', handle: 'chamindu_k', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-19', name: 'තිළිණි අබේවික්‍රම', handle: 'thilini_a', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-20', name: 'සහන් බණ්ඩාර', handle: 'sahan_b', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-21', name: 'අමායා ජයසේකර', handle: 'amaya_j', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-22', name: 'දසුන් ශානක', handle: 'dasun_s', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-23', name: 'චලනි මධුභාෂිණී', handle: 'chalani_m', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-24', name: 'මලින්ද සුරේෂ්', handle: 'malinda_s', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-25', name: 'ඉනෝකා ප්‍රියදර්ශනී', handle: 'inoka_p', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-26', name: 'අකලංක දිසානායක', handle: 'akalanka_d', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-27', name: 'නිපුනි ප්‍රනාන්දු', handle: 'nipuni_f', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-28', name: 'විශ්ව කෞෂල්‍ය', handle: 'vishwa_k', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-29', name: 'හංසනී විජේතුංග', handle: 'hansani_w', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-30', name: 'ධනුෂ්ක අලුත්ගේ', handle: 'dhanushka_a', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-31', name: 'රෂිණි පෙරේරා', handle: 'rashini_p', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-32', name: 'අසේල සම්පත්', handle: 'asela_s', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-33', name: 'මනෝජ් කුමාර', handle: 'manoj_k', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-34', name: 'තනූජා අබේසිංහ', handle: 'thanuja_a', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { id: 'user-35', name: 'ශෙහාන් ගුණසේකර', handle: 'shehan_g', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
  ];

  const users = await Promise.all(
    rawUsers.map((u) =>
      prisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          handle: u.handle,
          avatarUrl: u.avatar,
        },
      })
    )
  );

  console.log(`[Seeder] Seeded ${users.length} Sinhala users.`);
  console.log('[Seeder] Seeding 11 Calibrated Synthetic Sinhala Posts...');

  const postsData = [
    // 1. POSITIVE: Cricket Victory (Joy, Excitement, Approval, Pride)
    {
      id: 'sinhala-post-1',
      authorId: 'user-3', // Isuru Wijesinghe
      content: 'ශ්‍රී ලංකා කොල්ලන්ට උණුසුම් සුබ පැතුම්! 🏏🇱🇰 මොන තරම් විශිෂ්ට සටනක්ද මේක... අවසාන පන්දු ඕවරය වෙනකම්ම හුස්ම අල්ලගෙන බැලුවේ. අපේ රටට ජය වේවා!',
      mediaUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&auto=format&fit=crop&q=80',
      reactionCounts: { LIKE: 12, LOVE: 15, WOW: 6 },
      comments: [
        { authorId: 'user-5', text: 'අපේ කොල්ලො ටික නම් සුපිරියටම සෙල්ලම් කරා ආඩම්බරයි ලංකාව ගැන 🇱🇰🔥' },
        { authorId: 'user-1', text: 'ජයවේවා ශ්‍රී ලංකා! විශිෂ්ට ජයග්‍රහණයක් කොල්ලනේ. සුබ පැතුම්!' },
        { authorId: 'user-me', text: 'අන්තිම මොහොත වෙනකන් සටන අතෑරියේ නෑ. ඇත්තටම හරිම සතුටුයි.' },
        { authorId: 'user-6', text: 'නියම නායකත්වයක් දුන්නේ, දිගටම මේ විදිහට සෙල්ලම් කරමු!' },
        { authorId: 'user-8', text: 'මුළු රටම එකතු වෙලා අද සතුට සමරනවා. සුපිරිම මැච් එකක්!' },
      ],
    },

    // 2. POSITIVE: Rural School Donation (Affection, Care/Empathy, Gratitude, Joy)
    {
      id: 'sinhala-post-2',
      authorId: 'user-2', // Nethmi Silva
      content: 'මහියංගණය දුෂ්කර පාසලක පුංචි දරුවන් වෙනුවෙන් පුස්තකාලයක් සහ ශිෂ්‍යත්ව ලබාදීමේ වැඩසටහන සාර්ථකව අවසන් කළා. දායක වූ සැමට පිං! 📚🎒❤️',
      mediaUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
      reactionCounts: { LIKE: 10, LOVE: 18, WOW: 4 },
      comments: [
        { authorId: 'user-4', text: 'හදවතින්ම ගෞරව කරනවා මේ උතුම් පුණ්‍ය කටයුත්තට. දරුවන්ට සුබ අනාගතයක් වේවා! 🙏❤️' },
        { authorId: 'user-7', text: 'මේ පුංචි දරුවන්ගේ මුහුණුවල තියෙන හිනාව දකිද්දී හිතට පුදුම සතුටක් සහ සැනසීමක් දැනෙනවා.' },
        { authorId: 'user-9', text: 'ගොඩක් පිං මේ වගේ හොඳ වැඩක් සංවිධානය කරපු හැමෝටම.' },
        { authorId: 'user-11', text: 'අනාගත පරපුරට පොතපත කියවන්න අවස්ථාව ලබාදීම ලොකුම සත්කාරයක්. තව තවත් ශක්තිය ධෛර්යය ලැබේවා!' },
        { authorId: 'user-13', text: 'ඇස්වලට සතුටු කඳුළු ආවා දරුවන්ගේ සතුට දැකලා. ආදරෙයි හැමෝටම ❤️' },
      ],
    },

    // 3. POSITIVE: University Graduation (Joy, Pride, Approval, Affection)
    {
      id: 'sinhala-post-3',
      authorId: 'user-5', // Sachintha Madushanka
      content: 'අවුරුදු 4ක කැපවීම සාර්ථකයි! මොරටුව විශ්වවිද්‍යාලයෙන් ඉංජිනේරු උපාධිය අද නිල වශයෙන් ලබාගත්තා. මගේ ආදරණීය දෙමව්පියන්ට සහ ගුරුවරුන්ට හදවතින්ම ස්තූතියි! 🎓✨',
      mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
      reactionCounts: { LIKE: 14, LOVE: 16, WOW: 5 },
      comments: [
        { authorId: 'user-me', text: 'උණුසුම් සුබ පැතුම් සහෝදරයා! උඹේ ඉදිරි ගමනට ජයම වේවා! ආඩම්බරයි.' },
        { authorId: 'user-1', text: 'Congratulations brother! Hard work truly paid off. Wishing you all the best!' },
        { authorId: 'user-12', text: 'නියමයි මල්ලී, දෙමව්පියන්ගේ ආශිර්වාදයෙන් ලස්සන අනාගතයක් උදාවේවා!' },
        { authorId: 'user-14', text: 'හදවතින්ම සුබ පතනවා! රටට වැඩදායී උගතෙක් වේවා.' },
      ],
    },

    // 4. NEGATIVE: Train & Transport Breakdown (Anger, Disappointment, Disgust)
    {
      id: 'sinhala-post-4',
      authorId: 'user-1', // Dilan Fernando
      content: 'අදත් කාර්යාල දුම්රිය පැය තුනක් ප්‍රමාදයි. දහස් ගණනක් මගීන් දුක් විඳිනවා. බලධාරීන්ගේ කිසිම වගකීමක් නෑ! 🚂🚫😤',
      mediaUrl: 'https://images.unsplash.com/photo-1515165562839-978bbcf18277?w=1200&auto=format&fit=crop&q=80',
      reactionCounts: { LIKE: 2, WOW: 2, HAHA: 1, SAD: 8, ANGRY: 20 },
      comments: [
        { authorId: 'user-3', text: 'ලැජ්ජයි මේ පාලකයන්ට! හැමදාම සාමාන්‍ය මිනිස්සු දුක් විඳිනවා මේ ක්‍රමය නිසා 😡' },
        { authorId: 'user-6', text: 'පැය තුනක් තිස්සේ මඟ රැඳිලා ඉන්නේ. කිසිම වගකීමක් නෑ බලධාරීන්ට. අන්තිම අසාධාරණයි!' },
        { authorId: 'user-8', text: 'මුන්ගේ බොරු පොරොන්දු වලට රැවටුන එකට අපිටමයි ගහන්න ඕනේ. වැඩක් නෑ කතා කරලා.' },
        { authorId: 'user-10', text: 'සල්ලි කඩාගන්න විතරයි දන්නේ, කිසිම පහසුකමක් සපයන්නේ නෑ. සම්පූර්ණ අසාර්ථකයි.' },
        { authorId: 'user-16', text: 'මේ අසාධාරණයට එරෙහිව කවුරුත් කතා නොකරන එක තමයි ලොකුම විනාශය. පිළිකුල් මේ ක්‍රමය!' },
      ],
    },

    // 5. NEGATIVE: Road Accident Reckless Driving (Sadness, Care/Empathy, Grief, Disappointment)
    {
      id: 'sinhala-post-5',
      authorId: 'user-6', // Tharaka Jayawardena
      content: 'අද උදෑසන නුවර පාරේ සිදුවූ බිහිසුණු රිය අනතුරකින් තිදෙනෙකු ජීවිතක්ෂයට පත්ව ඇත. නොසැලකිලිමත් ධාවනය නිසා අහිංසක ජීවිත බිලිගනී... ⚠️🚨',
      mediaUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=1200&auto=format&fit=crop&q=80',
      reactionCounts: { LIKE: 1, WOW: 1, SAD: 18, ANGRY: 15 },
      comments: [
        { authorId: 'user-18', text: 'අධික වේගය නිසා අහිංසක ජීවිත කීයක් නම් නැතිවෙනවද පාරවල් වල 😡💔' },
        { authorId: 'user-20', text: 'මේ රියදුරන්ට දැඩි දඬුවම් දෙන්න ඕනේ. කිසිම විනයක් නෑ පාරේ යනකොට.' },
        { authorId: 'user-22', text: 'හදවත කම්පා වෙනවා මේ විනාශය දැකලා. අසරණ පවුලක් අද අනාථ වෙලා.' },
        { authorId: 'user-24', text: 'හැමදාම මේ වගේ අනතුරු වෙනවා, ඒත් නීතියක් ක්‍රියාත්මක වෙන්නේ නෑ. කාලකණ්ණි හැසිරීමක්.' },
        { authorId: 'user-26', text: 'දරාගන්න බැරි ශෝකයක් මේක... ලැජ්ජා වෙන්න ඕන වගකිවයුත්තෝ.' },
      ],
    },

    // 6. NEGATIVE: Electricity & Water Price Hike (Disappointment, Anger, Sadness)
    {
      id: 'sinhala-post-6',
      authorId: 'user-4', // Chathurika Lakmali
      content: 'ලබන මස සිට විදුලි සහ ජල ගාස්තු තවත් 25% කින් ඉහළ දැමීමට තීරණය කර ඇත. ජීවන වියදම තවත් ඉහළට... 📉⚡',
      mediaUrl: null,
      reactionCounts: { LIKE: 1, WOW: 3, SAD: 10, ANGRY: 18 },
      comments: [
        { authorId: 'user-me', text: 'මිනිස්සුන්ට ජීවත් වෙන්න ක්‍රමයක් නෑ දැන්. හැම පැත්තෙන්ම හූරගෙන කනවා 😡' },
        { authorId: 'user-2', text: 'පඩි වැඩි වෙන්නේ නෑ, ඒත් බිල්පත් විතරක් අහස උසට. අන්තිම අසාධාරණ තීරණයක්.' },
        { authorId: 'user-7', text: 'මේවට විරුද්ධ වෙන්න එකෙක් නෑ. සාමාන්‍ය පවුල් කොහොමද මේවා ගෙවන්නේ?' },
        { authorId: 'user-15', text: 'හැමදාම අසරණ මිනිස්සුන්ගේ කරපිටින් තමයි පාඩු පියවන්නේ. ලැජ්ජයි!' },
      ],
    },

    // 7. MIXED: Veteran Artist Passing Tribute (Sadness, Grief, Nostalgia, Affection)
    {
      id: 'sinhala-post-7',
      authorId: 'user-7', // Pabasari Ariyaratne
      content: 'අප රටේ ප්‍රවීණ ගායනවේදී ගාමිණී සුසිරිපාල මහතා අභාවප්‍රාප්ත විය. දේශීය සංගීත ක්ෂේත්‍රයට පිරිමැසිය නොහැකි පාඩුවක්... ඔබට නිවන් සුව! 🕊️🕯️',
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
      reactionCounts: { LIKE: 1, LOVE: 1, WOW: 1, SAD: 25 },
      comments: [
        { authorId: 'user-9', text: 'නිවන් සුව ලැබේවා අපේ ආදරණීය කලාකරුවාණෙනි... ඔබ කළ සේවය අපේ හදවත් තුළ සදා නොමැකී රැඳේවි 💔😢' },
        { authorId: 'user-11', text: 'අද ලංකාවේ කලාවට පිරිමැසිය නොහැකි පාඩුවක්. ඇත්තටම හිතාගන්නත් බෑ මේ ආරංචිය.' },
        { authorId: 'user-17', text: 'ඔබගේ ගීත හැමදාම අපේ ජීවිත වලට සැනසීමක් දුන්නා. ඔබට නිවන් සුව පතමු.' },
        { authorId: 'user-19', text: 'දරාගන්න බැරි තරම් ලොකු වේදනාවක්. පවුලේ සැමට මේ දුක දරාගැනීමට ශක්තිය ලැබේවා.' },
        { authorId: 'user-21', text: 'කලාවේ යුගයක් අදින් නිමාවුණා... ඔබ සැමදා අමරණීයයි!' },
      ],
    },

    // 8. MIXED: School Reunion Nostalgia (Nostalgia, Sadness, Grief, Affection)
    {
      id: 'sinhala-post-8',
      authorId: 'user-8', // Kavindu Madushan
      content: 'අවුරුදු 10කට කලින් අපි පාසලේ එකට ගත්තු ඡායාරූපයක් අහඹු ලෙස හමුවුණා. කාලය කොච්චර ඉක්මනට ගෙවිලා ගියාද... 🏫📸',
      mediaUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80',
      reactionCounts: { LIKE: 8, LOVE: 8, WOW: 1, HAHA: 2, SAD: 12 },
      comments: [
        { authorId: 'user-10', text: 'අවුරුදු දහයකට කලින් අපි හිටපු විදිහ මතක් වෙනකොට ඇස් වලට කඳුළු එනවා... කාලය කොච්චර ඉක්මනට ගෙවිලද 🥺🍂' },
        { authorId: 'user-12', text: 'ඒ සුන්දර කාලය ආයේ කවදාවත් එන්නේ නෑ මචං. හරිම නිදහස් ලස්සන මතක ගොඩක්.' },
        { authorId: 'user-23', text: 'ඉස්කෝලේ වෑන් එකේ ගියපු හැටි, පන්ති කට් කරපු හැටි ඔක්කොම ඊයේ වගේ මතකයි.' },
        { authorId: 'user-25', text: 'සතුටුයි අපි හැමෝම අද හොඳ තැන්වල ඉන්න එක ගැන, ඒත් ඒ පාසල් කාලේ තරම් සැනසීමක් කොහෙවත් නෑ. හිතට දුකයි.' },
        { authorId: 'user-27', text: 'අපි ආයෙත් කවදා හරි මේ වගේ එකතු වෙමු යාළුවනේ.' },
      ],
    },

    // 9. MIXED: Independent Life Irony (Sadness, Nostalgia, Affection, Sarcasm)
    {
      id: 'sinhala-post-9',
      authorId: 'user-9', // Sanduni Gamage
      content: 'Strong independent කියලා පෙන්නුවට, රෑට තනියම ඉන්නකොට පොඩි දේකටත් ඇඬෙනවා. ජීවිතේ පුදුම ප්‍රහේලිකාවක්! 😂💔',
      mediaUrl: null,
      reactionCounts: { LIKE: 10, LOVE: 5, WOW: 2, HAHA: 11, SAD: 8 },
      comments: [
        { authorId: 'user-me', text: 'හිනා වෙන්නද අඬන්නද කියලා හිතාගන්න බෑ මේක දැකලා 😅' },
        { authorId: 'user-13', text: 'ඇත්තම කතාව ඕක තමයි. මතුපිටින් හිනාවුණාට හිත ඇතුලෙන් හැමෝම තනිවෙලා.' },
        { authorId: 'user-15', text: 'ඕවා ගණන් ගන්න එපා සහෝදරී, ජීවිතේ හැටි ඔහොම තමයි. සතුටින් ඉන්න!' },
        { authorId: 'user-28', text: 'අම්මෝ ඒක නම් හදවතටම වැදුණා. මාත් ඕක අත්විඳිනවා.' },
      ],
    },

    // 10. NEUTRAL: Exam Center Relocation Notice (Confusion, Hope, Disappointment)
    {
      id: 'sinhala-post-10',
      authorId: 'user-10', // Ravindu Hemantha
      content: '2026 උසස් පෙළ විභාගයේ අංක 102 දරන මධ්‍යස්ථානය හෙට දින සිට යාබද විද්‍යාලය වෙත මාරු කර ඇති බව විභාග දෙපාර්තමේන්තුව දන්වා සිටී. 🏛️📋',
      mediaUrl: null,
      reactionCounts: { LIKE: 6, WOW: 2 },
      comments: [
        { authorId: 'user-29', text: 'අදාළ විභාග ප්‍රවේශ පත්‍ර නැවත ලබාගත යුතුද?' },
        { authorId: 'user-30', text: 'මෙම මධ්‍යස්ථානයට ඇතුළුවිය හැකි වේලාව කීයද?' },
        { authorId: 'user-31', text: 'විභාග කොමසාරිස් කාර්යාලයේ නිල දුරකථන අංකය ලබාදෙන්න.' },
        { authorId: 'user-32', text: 'මෙම තොරතුර තහවුරු කරන්නේ කොහොමද?' },
      ],
    },

    // 11. NEUTRAL: Weather Forecast Advisory (Confusion, Disappointment)
    {
      id: 'sinhala-post-11',
      authorId: 'user-11', // Hirushi Wickramasinghe
      content: 'බස්නාහිර සහ සබරගමුව පළාත්වල තැනින් තැන වැසි හෝ ගිගුරුම් සහිත වැසි ඇති විය හැකි බව කාලගුණ විද්‍යා දෙපාර්තමේන්තුව නිවේදනය කරයි. 🌧️📋',
      mediaUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1200&auto=format&fit=crop&q=80',
      reactionCounts: { LIKE: 10, LOVE: 1, WOW: 1 },
      comments: [
        { authorId: 'user-33', text: 'අද දින කොළඹ අවට කාලගුණය කෙසේද?' },
        { authorId: 'user-34', text: 'මෙම නිවේදනය වලංගු වන්නේ කුමන වේලාව දක්වාද?' },
        { authorId: 'user-35', text: 'වැඩිදුර තොරතුරු සඳහා වෙබ් අඩවිය පරීක්ෂා කරන්න.' },
        { authorId: 'user-me', text: 'ස්තූතියි නිවේදනය කළාට.' },
      ],
    },
  ];

  let totalReactions = 0;
  let totalComments = 0;

  for (let i = 0; i < postsData.length; i++) {
    const p = postsData[i];
    // Stagger creation timestamps (15 mins to 8 hours ago)
    const createdAt = new Date(Date.now() - (i + 1) * 1000 * 60 * 45);

    const createdPost = await prisma.post.create({
      data: {
        id: p.id,
        authorId: p.authorId,
        content: p.content,
        mediaUrl: p.mediaUrl,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Expand reaction counts into distinct user assignments
    const reactionTypesList: string[] = [];
    for (const [type, count] of Object.entries(p.reactionCounts)) {
      for (let k = 0; k < count; k++) {
        reactionTypesList.push(type);
      }
    }

    // Assign each reaction to a unique user from the pool (satisfies @@unique([postId, userId]))
    for (let uIdx = 0; uIdx < reactionTypesList.length; uIdx++) {
      if (uIdx >= users.length) break; // Safety check
      const rxnType = reactionTypesList[uIdx];
      const assignedUserId = users[uIdx].id;

      await prisma.reaction.create({
        data: {
          postId: createdPost.id,
          userId: assignedUserId,
          type: rxnType,
        },
      });
      totalReactions++;
    }

    // Seed comments with distinct authors and staggered timestamps
    for (let cIdx = 0; cIdx < p.comments.length; cIdx++) {
      const c = p.comments[cIdx];
      await prisma.comment.create({
        data: {
          postId: createdPost.id,
          authorId: c.authorId,
          text: c.text,
          createdAt: new Date(createdAt.getTime() + 1000 * 60 * (cIdx + 1) * 6),
        },
      });
      totalComments++;
    }
  }

  console.log(`[Seeder] Seeded ${postsData.length} Sinhala posts, ${totalReactions} reactions, ${totalComments} comments.`);

  return {
    usersCount: users.length,
    postsCount: postsData.length,
    reactionsCount: totalReactions,
    commentsCount: totalComments,
  };
}

// Direct execution via CLI
if (require.main === module) {
  seedDatabase()
    .then((stats) => {
      console.log('[Seeder] Sinhala Database seeding finished successfully:', stats);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seeder] Seeding failed with error:', err);
      process.exit(1);
    });
}
