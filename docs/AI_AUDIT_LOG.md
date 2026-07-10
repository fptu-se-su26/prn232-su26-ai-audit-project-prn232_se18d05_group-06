# AI Audit Log

## 1. ThÃ´ng tin chung

| ThÃ´ng tin | Ná»™i dung |
|---|---|
| MÃ´n há»c |Building Cross-Platform Back-End Application With .NET  |
| MÃ£ mÃ´n há»c | PRN232 |
| Lá»›p |	SE18D05  |
| Há»c ká»³ | 8 |
| TÃªn bÃ i táº­p / Project | FleetNova - Há»‡ thá»‘ng Quáº£n trá»‹ Logistics ThÃ´ng minh  |
| TÃªn sinh viÃªn / NhÃ³m | NhÃ³m 6 |
| MSSV / Danh sÃ¡ch MSSV | DE180071,DE180096,DE180088,DE180109,DE180104 |
| Giáº£ng viÃªn hÆ°á»›ng dáº«n | LÃª Thiá»‡n Nháº­t Quang |
| NgÃ y báº¯t Ä‘áº§u | 17/05/2026 |
| NgÃ y hoÃ n thÃ nh | 09/06/2026 |

---

## 2. CÃ´ng cá»¥ AI Ä‘Ã£ sá»­ dá»¥ng

ÄÃ¡nh dáº¥u cÃ¡c cÃ´ng cá»¥ AI Ä‘Ã£ sá»­ dá»¥ng trong quÃ¡ trÃ¬nh thá»±c hiá»‡n bÃ i táº­p/project.

- [x] ChatGPT
- [x] Gemini
- [x] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] CÃ´ng cá»¥ khÃ¡c: ....................................

---

## 3. Má»¥c tiÃªu sá»­ dá»¥ng AI

### MÃ´ táº£ má»¥c tiÃªu sá»­ dá»¥ng AI

NhÃ³m sá»­ dá»¥ng AI lÃ m trá»£ lÃ½ ká»¹ thuáº­t xuyÃªn suá»‘t dá»± Ã¡n FleetNova nháº±m tá»‘i Æ°u hÃ³a thá»i gian nghiÃªn cá»©u cÃ´ng nghá»‡, xÃ¢y dá»±ng nhanh cÃ¡c module lÃµi cÃ³ yáº¿u tá»‘ thÃ´ng minh (AI/ML) nhÆ° tá»‘i Æ°u tuyáº¿n Ä‘Æ°á»ng giao hÃ ng, nháº­n diá»‡n hÃ³a Ä‘Æ¡n vÃ  dá»± bÃ¡o tÃ i chÃ­nh. Äá»“ng thá»i, AI há»— trá»£ kiá»ƒm tra tÃ­nh Ä‘Ãºng Ä‘áº¯n cá»§a mÃ£ nguá»“n, phÃ¡t hiá»‡n lá»— há»•ng logic trong khÃ¢u Ä‘á»‘i soÃ¡t tÃ i chÃ­nh COD vÃ  dá»‹ch thuáº­t/chuáº©n hÃ³a cÃ¡c thuáº­t ngá»¯ chuyÃªn ngÃ nh Logistics.

---

## 4. Nháº­t kÃ½ sá»­ dá»¥ng AI chi tiáº¿t

## Log #01
- Date: 2026-05-24
- Author: VÅ© LÃª Duy (DE180104)
- AI Tool: ChatGPT
- Purpose: Táº¡o layout cho Sidebar Ä‘iá»u phá»‘i
- Prompt Reference: PROMPTS.md#prompt-01
- AI Output Summary: Gá»£i Ã½ sá»­ dá»¥ng CSS Flexbox `h-screen` vÃ  `overflow-y-auto`
- Human Decision: Thay Ä‘á»•i tÃ´ng mÃ u ná»n xÃ¡m máº·c Ä‘á»‹nh sang mÃ u xanh navy vÃ  bo gÃ³c cÃ¡c Ã´ (glass-panel)
- Applied To: FRONTEND/src/layouts/DispatcherLayout.tsx
- Verification: Cháº¡y localhost:5173 vÃ  co dÃ£n mÃ n hÃ¬nh Ä‘á»ƒ xem hiá»ƒn thá»‹ layout.

## Log #02
- Date: 2026-05-25
- Author: VÅ© LÃª Duy (DE180104)
- AI Tool: Gemini
- Purpose: Cáº¥u hÃ¬nh Router Ä‘á»‹nh tuyáº¿n
- Prompt Reference: PROMPTS.md#prompt-02
- AI Output Summary: Gá»£i Ã½ sá»­ dá»¥ng react-router-dom v6 vá»›i Routes vÃ  Route
- Human Decision: Thay Ä‘á»•i import tÆ°Æ¡ng Ä‘á»‘i vÃ  thÃªm Catch-all Route
- Applied To: FRONTEND/src/App.tsx
- Verification: Click chuyá»ƒn trang giá»¯a /dispatcher vÃ  /driver thÃ nh cÃ´ng.

## Log #03
- Date: 2026-05-27
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: Antigravity
- Purpose: TÃ­ch há»£p thiáº¿t káº¿ Glassmorphism cho AuthPage vÃ  Profile
- Prompt Reference: PROMPTS.md#prompt-03
- AI Output Summary: Gá»£i Ã½ cÃ¡c class `backdrop-blur-md` vÃ  `bg-white/10` cho card UI.
- Human Decision: Tinh chá»‰nh Ä‘á»™ má» cá»§a card vÃ  mÃ u border Ä‘á»ƒ ná»•i báº­t trÃªn ná»n tá»‘i (navy).
- Applied To: FRONTEND/src/features/auth/AuthPage.tsx, FRONTEND/src/features/customer/CustomerProfile.tsx
- Verification: Kiá»ƒm tra hiá»ƒn thá»‹ trÃªn trÃ¬nh duyá»‡t, Ä‘áº£m báº£o chá»¯ rÃµ rÃ ng trÃªn ná»n má».

## Log #04
- Date: 2026-05-29
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: ChatGPT
- Purpose: Xá»­ lÃ½ hiá»ƒn thá»‹ danh sÃ¡ch Ä‘Æ¡n hÃ ng Ä‘á»™ng
- Prompt Reference: PROMPTS.md#prompt-04
- AI Output Summary: Gá»£i Ã½ dÃ¹ng `.map()` Ä‘á»ƒ render danh sÃ¡ch tháº» Ä‘Æ¡n hÃ ng tá»« máº£ng dá»¯ liá»‡u.
- Human Decision: ThÃªm logic phÃ¢n loáº¡i tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng (Äang giao, HoÃ n thÃ nh) báº±ng mÃ u sáº¯c badge riÃªng biá»‡t.
- Applied To: FRONTEND/src/features/customer/OrderHistory.tsx, FRONTEND/src/features/customer/CustomerDashboard.tsx
- Verification: ThÃªm dá»¯ liá»‡u giáº£ vÃ o máº£ng vÃ  xem danh sÃ¡ch cÃ³ hiá»ƒn thá»‹ Ä‘Ãºng vÃ  Ä‘á»“ng nháº¥t khÃ´ng.

## Log #05
- Date: 2026-05-31
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: Antigravity
- Purpose: Váº½ lá»™ trÃ¬nh trÃªn báº£n Ä‘á»“ theo dÃµi (OrderTrackingMap)
- Prompt Reference: PROMPTS.md#prompt-05
- AI Output Summary: Gá»£i Ã½ cáº¥u trÃºc SVG vÃ  cÃ¡c animation CSS cho icon xe táº£i di chuyá»ƒn theo Ä‘Æ°á»ng káº».
- Human Decision: Thay Ä‘á»•i icon xe táº£i sang SVG cao cáº¥p hÆ¡n vÃ  chá»‰nh láº¡i tá»‘c Ä‘á»™ animation cho mÆ°á»£t mÃ .
- Applied To: FRONTEND/src/features/customer/OrderTrackingMap.tsx
- Verification: Quan sÃ¡t xe táº£i di chuyá»ƒn trÃªn lá»™ trÃ¬nh khi load trang trÃªn Chrome.

## Log #06
- Date: 2026-06-01
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: Gemini
- Purpose: Thiáº¿t káº¿ Voucher Center vÃ  Support Chat
- Prompt Reference: PROMPTS.md#prompt-06
- AI Output Summary: Gá»£i Ã½ layout lÆ°á»›i (Grid) cho cÃ¡c tháº» khuyáº¿n mÃ£i vÃ  cáº¥u trÃºc khung chat box.
- Human Decision: TÃ¹y chá»‰nh hiá»‡u á»©ng hover cho voucher vÃ  phá»‘i há»£p mÃ u sáº¯c tin nháº¯n chat theo theme chung.
- Applied To: FRONTEND/src/features/voucher/VoucherCenter.tsx, FRONTEND/src/features/support/SupportChat.tsx
- Verification: Kiá»ƒm tra tÆ°Æ¡ng tÃ¡c hover voucher vÃ  nháº­p tin nháº¯n vÃ o khung chat thÃ nh cÃ´ng.

## Log #07
- Date: 2026-06-09
- Author: LÃª Quá»‘c HÃ¹ng (DE180096)
- AI Tool: Antigravity
- Purpose: Tham kháº£o thiáº¿t káº¿ DB cho In váº­n Ä‘Æ¡n (UC004)
- Prompt Reference: PROMPTS.md#prompt-07
- AI Output Summary: Gá»£i Ã½ cÃ¡c trÆ°á»ng dá»¯ liá»‡u cáº§n thiáº¿t cho báº£ng Waybill vÃ  Picking List.
- Human Decision: NhÃ³m tá»± thiáº¿t káº¿ báº£ng `Waybills` thÃ´ng qua Entity Framework Core, Ã¡nh xáº¡ cÃ¡c trÆ°á»ng cho phÃ¹ há»£p vá»›i yÃªu cáº§u thá»±c táº¿ cá»§a dá»± Ã¡n vÃ  tá»± code cÃ¡c API CRUD liÃªn quan.
- Applied To: BACKEND/DTOs/OutboundRequestDto.cs, BACKEND/Models/Entities.cs, BACKEND/Controllers/OutboundController.cs
- Verification: Cháº¡y lá»‡nh add-migration vÃ  update-database thÃ nh cÃ´ng.

## Log #08
- Date: 2026-06-10
- Author: LÃª Quá»‘c HÃ¹ng (DE180096)
- AI Tool: Antigravity
- Purpose: CÃº phÃ¡p Axios gá»i API cÃ³ Token
- Prompt Reference: PROMPTS.md#prompt-08
- AI Output Summary: Cung cáº¥p Ä‘oáº¡n code máº«u gá»i Axios POST vá»›i Header Authorization.
- Human Decision: NhÃ³m tá»± tÃ­ch há»£p vÃ o file cáº¥u hÃ¬nh API, viáº¿t thÃªm interceptor Ä‘á»ƒ báº¯t lá»—i token háº¿t háº¡n vÃ  refresh láº¡i token tá»± Ä‘á»™ng.
- Applied To: FRONTEND/src/lib/api.ts, FRONTEND/src/features/auth/AuthPage.tsx
- Verification: ÄÄƒng nháº­p thÃ nh cÃ´ng vÃ  console log tráº£ vá» thÃ´ng tin user chÃ­nh xÃ¡c.

## Log #09
- Date: 2026-06-15
- Author: VÅ© LÃª Duy (DE180104)
- AI Tool: Antigravity
- Purpose: Tham kháº£o quy trÃ¬nh xÃ¡c thá»±c Google Login vÃ  JWT
- Prompt Reference: PROMPTS.md#prompt-09
- AI Output Summary: Cung cáº¥p tÃ i liá»‡u cáº¥u hÃ¬nh `Google.Apis.Auth` vÃ  code máº«u sinh token JWT.
- Human Decision: NhÃ³m chá»‰ dÃ¹ng code máº«u Ä‘á»ƒ kiá»ƒm tra token Google. Sau Ä‘Ã³ tá»± viáº¿t Endpoint `[HttpPost("google")]` vÃ  tá»± cáº¥u hÃ¬nh JWT Claims Ä‘á»ƒ phÃ¢n quyá»n dá»±a vÃ o Database thá»±c táº¿.
- Applied To: BACKEND/Controllers/AuthController.cs, BACKEND/DTOs/AuthDTOs.cs
- Verification: ÄÄƒng nháº­p báº±ng tÃ i khoáº£n Google thÃ nh cÃ´ng, láº¥y Ä‘Æ°á»£c JWT token vÃ  giáº£i
## Log #11
- Date: 2026-06-21
- Author: LÃª Quá»‘c HÃ¹ng (DE180096)
- AI Tool: Antigravity
- Purpose: Triá»ƒn khai UC018 (Track Vehicle Entry/Exit) vÃ  tá»‘i Æ°u Ä‘á»™ tÆ°Æ¡ng pháº£n vÄƒn báº£n UI
- Prompt Reference: PROMPTS.md#prompt-11
- AI Output Summary: Gá»£i Ã½ cÃ¡ch cháº·n thao tÃ¡c UPDATE/DELETE á»Ÿ SaveChanges, thuáº­t toÃ¡n Ä‘áº¿m cáº·p CheckIn/CheckOut, vÃ  thay tháº¿ class mÃ u text-on-surface-variant.
- Human Decision: Tá»± phÃ¡t triá»ƒn hoÃ n thiá»‡n giao diá»‡n Ä‘iá»u hÃ nh dÃ²ng thá»i gian di chuyá»ƒn, vÃ  thay Ä‘á»•i linh hoáº¡t cÃ¡c class mÃ u text sang slate-300, slate-400 vÃ  xanh dÆ°Æ¡ng Ä‘á»ƒ Ä‘á»“ng bá»™ vá»›i theme.
- Applied To: BACKEND/Models/SmartLogAiContext.cs, BACKEND/Services/TrackingService.cs, FRONTEND/src/features/dispatcher/pages/VehicleTrackingDashboard.tsx
- Verification: Thá»±c hiá»‡n ghi nháº­n chuá»—i sá»± kiá»‡n check-in â†” load â†” check-out, kiá»ƒm tra sá»‘ lÆ°á»£ng chuyáº¿n xe tÄƒng lÃªn Ä‘Ãºng ká»‹ch báº£n, cá»‘ tÃ¬nh gá»­i yÃªu cáº§u PUT cáº­p nháº­t thÃ¬ bá»‹ database cháº·n thÃ nh cÃ´ng.

## Log #12
- Date: 2026-06-21
- Author: LÃª Quá»‘c HÃ¹ng (DE180096)
- AI Tool: Antigravity
- Purpose: Triá»ƒn khai UC020 (Confirm Check-out & Exit Gate Control) vÃ  hoÃ n hoáº¡t SVG Barrier Gate
- Prompt Reference: PROMPTS.md#prompt-12
- AI Output Summary: Gá»£i Ã½ cáº¥u trÃºc GateService cháº¡y trong giao dá»‹ch ACID vÃ  code SVG/React mÃ´ phá»ng Barrier Gate xoay.
- Human Decision: Tá»± phÃ¡t triá»ƒn hoÃ n thiá»‡n giao diá»‡n Ä‘iá»u hÃ nh cá»•ng ra, thiáº¿t káº¿ báº£ng Ä‘iá»u khiá»ƒn báº£o vá»‡ vÃ  tÃ­ch há»£p cÃ¡c bá»™ giáº£ láº­p kiá»ƒm thá»­ nhanh cÃ¡c biá»ƒn sá»‘ xe.
- Applied To: BACKEND/Services/GateService.cs, BACKEND/Controllers/GateController.cs, FRONTEND/src/features/warehouse/GateCheckoutDashboard.tsx
- Verification: Sá»­ dá»¥ng Swagger thá»±c hiá»‡n check-out thÃ nh cÃ´ng cho xe 51C-88888, kiá»ƒm tra DB tháº¥y tráº¡ng thÃ¡i SlotBookings Ä‘Ã£ COMPLETED, DockID 1 vá» AVAILABLE, GateLogs ghi nháº­n sá»± kiá»‡n, vÃ  VehicleEvents ghi nháº­n check-out thÃ nh cÃ´ng.

## Log #13
- Date: 2026-06-29
- Author: LÃª Quá»‘c HÃ¹ng (DE180096)
- AI Tool: Antigravity (Claude Sonnet 4.6)
- Purpose: Triá»ƒn khai UC021 - Quáº£n lÃ½ Danh sÃ¡ch Äen PhÆ°Æ¡ng tiá»‡n & TÃ i xáº¿ (Blacklist Management)
- Prompt Reference: PROMPTS.md#prompt-13
- AI Output Summary: Gá»£i Ã½ thiáº¿t káº¿ guard clause blacklist nguyÃªn tá»­ trong GateService trÆ°á»›c má»i thao tÃ¡c booking, cáº¥u trÃºc BlacklistAlertDto Ä‘á»ƒ tráº£ vá» HTTP 403 Forbidden, thiáº¿t káº¿ toggle UI glassmorphism cho VehiclesTab & DispatchersTab, vÃ  Red Critical Security Alert Modal cho GateCheckoutDashboard.
- Human Decision: Tá»± kiá»ƒm tra nghiÃªm ngáº·t cÃ¡c rÃ ng buá»™c business: khÃ´ng táº¡o migration, khÃ´ng cho blacklist náº¿u thiáº¿u lÃ½ do, khÃ´ng gá»­i API náº¿u ngÆ°á»i dÃ¹ng há»§y prompt. Tá»± cháº¡y 3 ká»‹ch báº£n Ä‘áº§u cuá»‘i (blacklist xe, blacklist tÃ i xáº¿, unblacklist + check-in láº¡i) Ä‘á»ƒ xÃ¡c nháº­n tÃ­nh Ä‘Ãºng Ä‘áº¯n.
- Applied To: BACKEND/Services/VehicleService.cs, BACKEND/Services/DriverService.cs, BACKEND/Services/GateService.cs, BACKEND/Controllers/GateController.cs, FRONTEND/src/features/dispatcher/components/tabs/VehiclesTab.tsx, FRONTEND/src/features/dispatcher/components/tabs/DispatchersTab.tsx, FRONTEND/src/features/warehouse/GateCheckoutDashboard.tsx
- Verification: Test 3 case: (1) Blacklist xe â†’ check-in â†’ nháº­n 403 + modal Ä‘á» + barrier khÃ´ng má»Ÿ. (2) Blacklist tÃ i xáº¿ â†’ check-in â†’ nháº­n 403 + modal Ä‘á». (3) Unblacklist â†’ check-in láº¡i â†’ thÃ nh cÃ´ng bÃ¬nh thÆ°á»ng.

## Log #14
- Date: 2026-06-29
- Author: LÃª Quá»‘c HÃ¹ng (DE180096)
- AI Tool: Antigravity (Claude Sonnet 4.6)
- Purpose: Sá»­a lá»—i UI Contrast tá»‘i toÃ n diá»‡n trong Dispatcher Dashboard (Vehicles & Dispatchers Tabs)
- Prompt Reference: PROMPTS.md#prompt-14
- AI Output Summary: PhÃ¢n tÃ­ch nguyÃªn nhÃ¢n gá»‘c rá»…: `tailwind.config.js` Ä‘á»‹nh nghÄ©a trÃ¹ng key `on-surface`, `surface-variant`, v.v. khiáº¿n mÃ u light theme override mÃ u dark theme. Gá»£i Ã½ chuyá»ƒn cÃ¡c token mÃ u sang CSS custom properties vÃ  Ã¡p dá»¥ng `.dark` class override.
- Human Decision: Ãp dá»¥ng giáº£i phÃ¡p vÃ  kiá»ƒm tra láº¡i giao diá»‡n trÃªn trÃ¬nh duyá»‡t, xÃ¡c nháº­n Ä‘á»™ tÆ°Æ¡ng pháº£n vÃ  kháº£ nÄƒng Ä‘á»c cá»§a text trong cÃ¡c panel chi tiáº¿t xe, tÃ i xáº¿ vÃ  cÃ¡c Ä‘iá»u khiá»ƒn blacklist.
- Applied To: FRONTEND/tailwind.config.js, FRONTEND/src/index.css, FRONTEND/src/layouts/DispatcherLayout.tsx
- Verification: Cháº¡y `npm run build` thÃ nh cÃ´ng (0 lá»—i). Quan sÃ¡t trá»±c tiáº¿p cÃ¡c text trong panel chi tiáº¿t xe/tÃ i xáº¿ hiá»ƒn thá»‹ rÃµ rÃ ng, sÃ¡ng Ä‘á»§ trÃªn ná»n tá»‘i glassmorphism.

## Log #15
- Date: 2026-07-01
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: Antigravity
- Purpose: Cáº£i thiá»‡n toÃ n bá»™ UI/UX Dispatcher theo hÆ°á»›ng mÃ n hÃ¬nh váº­n hÃ nh logistics.
- Prompt Reference: PROMPTS.md#prompt-12
- AI Output Summary: Gá»£i Ã½ chuyá»ƒn tá»« giao diá»‡n tá»‘i/glow sang operations console sÃ¡ng, cÃ³ sidebar nhÃ³m chá»©c nÄƒng, header tÃ¬m kiáº¿m booking/biá»ƒn sá»‘/dock, KPI Dock & SLA, queue Ä‘iá»u phá»‘i, AI insight vÃ  nháº­t kÃ½ váº­n hÃ nh.
- Human Decision: NhÃ³m giá»¯ cáº¥u trÃºc tab Dispatcher hiá»‡n cÃ³, chá»‰ thay Ä‘á»•i UI/UX vÃ  nhÃ£n hiá»ƒn thá»‹ Ä‘á»ƒ phÃ¹ há»£p mÃ´ táº£ dá»± Ã¡n SmartLog AI.
- Applied To: FRONTEND/src/layouts/DispatcherLayout.tsx, FRONTEND/src/features/dispatcher/components/Sidebar.tsx, FRONTEND/src/features/dispatcher/components/Header.tsx, FRONTEND/src/features/dispatcher/components/tabs/DashboardTab.tsx, FRONTEND/src/index.css
- Verification: Kiá»ƒm tra route `/dispatcher`; trong mÃ n hÃ¬nh Dispatcher.

## Log #16
- Date: 2026-07-01
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: Antigravity
- Purpose: Gá»™p script SQL Overstay Alert vÃ o file SQL chÃ­nh.
- Prompt Reference: PROMPTS.md#prompt-13
- AI Output Summary: Äá» xuáº¥t loáº¡i bá» file setup rá»i, Ä‘Æ°a schema vÃ  seed Overstay Alert vÃ o `smartlogAI.sql` Ä‘á»ƒ trÃ¡nh lá»‡ch dá»¯ liá»‡u giá»¯a hai script.
- Human Decision: NhÃ³m giá»¯ `smartlogAI.sql` lÃ  nguá»“n chÃ­nh cho database, dÃ¹ng dá»¯ liá»‡u máº«u tá»± chá»n Vehicle/Dock/Booking cÃ³ sáºµn thay vÃ¬ hard-code phá»¥ thuá»™c mÃ´i trÆ°á»ng.
- Applied To: smartlogAI.sql
- Verification: RÃ  `rg` xÃ¡c nháº­n chá»‰ cÃ²n má»™t file SQL chÃ­nh chá»©a `VehicleDockSessions` vÃ  `OverstayAlerts`; khÃ´ng cháº¡y láº¡i script vÃ¬ cÃ³ lá»‡nh `DROP DATABASE`.

## Log #17
- Date: 2026-07-01
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: Antigravity
- Purpose: Giáº£m lá»—i console do SMTP khi StockAlertWorker cháº¡y ná»n.
- Prompt Reference: PROMPTS.md#prompt-14
- AI Output Summary: Gá»£i Ã½ báº¯t riÃªng lá»—i SMTP authentication Ä‘á»ƒ chuyá»ƒn sang simulated email thay vÃ¬ throw exception gÃ¢y spam log Ä‘á».
- Human Decision: NhÃ³m chá»‰ thay Ä‘á»•i hÃ nh vi khi SMTP tá»« chá»‘i xÃ¡c thá»±c; cÃ¡c lá»—i email khÃ¡c váº«n giá»¯ cÆ¡ cháº¿ log error vÃ  throw Ä‘á»ƒ khÃ´ng che lá»—i tháº­t.
- Applied To: BACKEND/Services/EmailService.cs
- Verification: Build backend sang thÆ° má»¥c kiá»ƒm tra thÃ nh cÃ´ng vÃ  endpoint Overstay Alert váº«n tráº£ HTTP 200.

## Log #18
- Date: 2026-07-02
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: Antigravity
- Purpose: AI Financial Trend Forecasting cho role Admin.
- Prompt Reference: PROMPTS.md#prompt-15
- AI Output Summary: Goi y tach use case thanh cac phan backend API forecast, schema database, service tinh xu huong tai chinh va dashboard Admin Finance co chart, KPI, insight, retrain model va export.
- Human Decision: Nhom chi ap dung phan phu hop voi cau truc hien co cua SmartLog AI, giu route `/admin/finance`, khong hien thi ma UC042 tren UI va thiet ke man hinh theo phong cach operations dashboard gon, sang, de doc.
- Applied To: BACKEND/Controllers/FinancialForecastController.cs, BACKEND/Services/FinancialForecastService.cs, BACKEND/DTOs/FinancialForecastDTOs.cs, BACKEND/Models/FinancialForecast.cs, BACKEND/Models/AiModelTrainingLog.cs, BACKEND/Models/SmartLogAiContext.UC023.cs, BACKEND/Program.cs, FRONTEND/src/features/admin/Finance.tsx, smartlogAI.sql
- Verification: `dotnet build` backend thanh cong; `npm run type-check` frontend van con loi cu ngoai pham vi UC042 do thieu `InventoryAudit.types`; thu seed SQL local khong thanh cong vi SQL Server `(local)` khong ket noi duoc.

## Log #15
- Date: 2026-07-08
- Author: Tráº§n VÄƒn TÃ¹ng (DE180109)
- AI Tool: Antigravity
- Purpose: HoÃ n thiá»‡n chá»©c nÄƒng Cáº£nh bÃ¡o tá»“n kho vÃ  gá»­i Email cho nhÃ¢n viÃªn phá»¥ trÃ¡ch.
- Prompt Reference: PROMPTS.md#prompt-20
- AI Output Summary: Gá»£i Ã½ kiá»ƒm tra chuá»—i lá»—i SMTP, cáº¥u hÃ¬nh Gmail App Password, sá»­a service gá»­i email tháº­t, thÃªm dá»¯ liá»‡u test tá»“n kho tháº¥p, cáº£i thiá»‡n luá»“ng quÃ©t thá»§ cÃ´ng vÃ  quÃ©t ná»n, Ä‘á»“ng thá»i lÃ m rÃµ tráº¡ng thÃ¡i gá»­i email trÃªn UI Stock Alerts.
- Human Decision: NhÃ³m Ã¡p dá»¥ng luá»“ng gá»­i email tháº­t báº±ng SMTP Gmail, Æ°u tiÃªn gá»­i vá» email cá»§a ngÆ°á»i Ä‘ang Ä‘Äƒng nháº­p thÃ´ng qua JWT claim, náº¿u khÃ´ng cÃ³ email thÃ¬ fallback vá» `tungtvde180109@fpt.edu.vn`. NÃºt QuÃ©t ngay Ä‘Æ°á»£c dÃ¹ng cho test thá»§ cÃ´ng nÃªn cho phÃ©p gá»­i láº¡i email, cÃ²n worker ná»n váº«n giá»¯ debounce Ä‘á»ƒ trÃ¡nh spam.
- Applied To: BACKEND/appsettings.json, BACKEND/Services/EmailService.cs, BACKEND/Services/StockAlertService.cs, BACKEND/Services/IStockAlertService.cs, BACKEND/Services/StockAlertWorker.cs, BACKEND/Controllers/StockAlertsController.cs, FRONTEND/src/features/warehouse/StockAlerts.tsx, insert-stock-alert-email-test.sql
- Verification: Test SMTP gá»­i thÃ nh cÃ´ng báº±ng Gmail App Password; gá»i `/api/stockalerts/scan?force=true` tráº£ vá» `ÄÃ£ gá»­i 3 email`; `dotnet build` backend thÃ nh cÃ´ng 0 warning/0 error; `npm run build` frontend thÃ nh cÃ´ng.
## Log #16
- Date: 2026-07-08
- Author: VÅ© LÃª Duy (DE180104)
- AI Tool: Antigravity
- Purpose: Kháº¯c phá»¥c lá»—i 500 khi Entity Framework Core khÃ´ng dá»‹ch Ä‘Æ°á»£c hÃ m C# sang SQL trong tÃ­nh nÄƒng ALPR Gate In/Out.
- Prompt Reference: PROMPTS.md#prompt-21
- AI Output Summary: PhÃ¡t hiá»‡n hÃ m `NormalizePlate()` gÃ¢y lá»—i `IQueryable` translation, gá»£i Ã½ dÃ¹ng `.Replace()` vÃ  `.ToUpper()` lá»“ng nhau Ä‘á»ƒ xá»­ lÃ½ chuá»—i trÃªn database server.
- Human Decision: XÃ¡c nháº­n thay Ä‘á»•i Ä‘Ãºng Ä‘áº¯n, Ã¡p dá»¥ng ngay vÃ o backend. NgoÃ i ra quyáº¿t Ä‘á»‹nh lÃ m Modal Pop-up Ä‘á» chÃ³t cho dá»… nhÃ¬n thay vÃ¬ in lá»—i 404 xuá»‘ng Console.
- Applied To: BACKEND/Services/GateService.cs, FRONTEND/src/features/warehouse/GateCheckoutDashboard.tsx
- Verification: ÄÃ£ cháº¡y thá»­ AI Camera quÃ©t biá»ƒn sá»‘ trÃªn trÃ¬nh duyá»‡t. Backend khÃ´ng cÃ²n vÄƒng lá»—i HTTP 500, Frontend hiá»‡n Ä‘Ãºng cáº£nh bÃ¡o UI Ä‘á».

--

## 5. Báº£ng tá»•ng há»£p má»©c Ä‘á»™ sá»­ dá»¥ng AI

ÄÃ¡nh dáº¥u má»©c Ä‘á»™ AI há»— trá»£ á»Ÿ tá»«ng háº¡ng má»¥c.

| Háº¡ng má»¥c | KhÃ´ng dÃ¹ng AI | AI há»— trá»£ Ã­t | AI há»— trá»£ nhiá»u | AI sinh chÃ­nh | Ghi chÃº |
|---|:---:|:---:|:---:|:---:|---|
| PhÃ¢n tÃ­ch yÃªu cáº§u |  | [x] |  |  |  |
| Viáº¿t user story/use case | [x] |  |  |  |  |
| Thiáº¿t káº¿ database | [x] |  |  |  |  |
| Thiáº¿t káº¿ kiáº¿n trÃºc há»‡ thá»‘ng | [x] |  |  |  |  |
| Thiáº¿t káº¿ giao diá»‡n |  | [x] |  |  |  |
| Code frontend |  | [x] |  |  |  |
| Code backend | [x] |  |  |  |  |
| Debug lá»—i |  | [x] |  |  |  |
| Viáº¿t test case | [x] |  |  |  |  |
| Kiá»ƒm thá»­ sáº£n pháº©m | [x] |  |  |  |  |
| Tá»‘i Æ°u code |  | [x] |  |  |  |
| Viáº¿t bÃ¡o cÃ¡o |  | [x] |  |  |  |
| LÃ m slide thuyáº¿t trÃ¬nh | [x] |  |  |  |  |

---

## 6. CÃ¡c lá»—i hoáº·c háº¡n cháº¿ tá»« AI

Ghi láº¡i cÃ¡c trÆ°á»ng há»£p AI tráº£ lá»i sai, thiáº¿u, chÆ°a phÃ¹ há»£p hoáº·c sinh code khÃ´ng cháº¡y.

| STT | Lá»—i/háº¡n cháº¿ tá»« AI | CÃ¡ch phÃ¡t hiá»‡n | CÃ¡ch xá»­ lÃ½/cáº£i tiáº¿n |
|---:|---|---|---|
| 1 | Sá»­ dá»¥ng class CSS Tailwind cÅ© khÃ´ng cÃ²n há»— trá»£ | TrÃ¬nh duyá»‡t khÃ´ng nháº­n diá»‡n Ä‘Æ°á»£c style vÃ  hiá»ƒn thá»‹ lá»‡ch | Tra cá»©u láº¡i tÃ i liá»‡u chÃ­nh thá»©c cá»§a Tailwind Ä‘á»ƒ cáº­p nháº­t láº¡i class Ä‘Ãºng |
| 2 | Code gá»£i Ã½ thiáº¿u import thÆ° viá»‡n Router | ChÆ°Æ¡ng trÃ¬nh bÃ¡o lá»—i compile thiáº¿u Ä‘á»‹nh nghÄ©a | Tá»± bá»• sung thá»§ cÃ´ng dÃ²ng import á»Ÿ Ä‘áº§u file |

---

## Log #19
- Date: 2026-07-09
- Author: VÅ© LÃª Duy (DE180104)
- AI Tool: ChatGPT/Codex
- Purpose: Tham kháº£o hÆ°á»›ng triá»ƒn khai nghiá»‡p vá»¥ quáº£n lÃ½ há»“ sÆ¡ phÆ°Æ¡ng tiá»‡n cho Dispatcher
- Prompt Reference: PROMPTS.md#prompt-22
- AI Output Summary: AI gá»£i Ã½ cÃ¡c Ä‘iá»ƒm cáº§n kiá»ƒm tra á»Ÿ backend/frontend nhÆ° DTO phÆ°Æ¡ng tiá»‡n, service Ä‘áº·t lá»‹ch, service check-in cá»•ng vÃ  UI danh sÃ¡ch phÆ°Æ¡ng tiá»‡n.
- Human Decision: Sinh viÃªn tá»± xÃ¡c Ä‘á»‹nh láº¡i yÃªu cáº§u nghiá»‡p vá»¥, chá»n cÃ¡ch giá»¯ dá»¯ liá»‡u Ä‘Äƒng kiá»ƒm/báº£o trÃ¬ trong báº£ng Vehicle, khÃ´ng táº¡o báº£ng má»›i; tá»± rÃ  soÃ¡t luá»“ng Ä‘áº·t lá»‹ch vÃ  check-in Ä‘á»ƒ Ä‘áº·t rule Ä‘Ãºng vá»‹ trÃ­.
- Applied To: BACKEND/Services/BookingService.cs, BACKEND/Services/GateService.cs, FRONTEND/src/features/dispatcher/components/tabs/VehiclesTab.tsx
- Verification: Cháº¡y `dotnet build`, `npm run build`, cháº¡y backend/frontend trÃªn localhost vÃ  kiá»ƒm tra thá»§ cÃ´ng mÃ n Dispatcher.

## Log #20
- Date: 2026-07-09
- Author: VÅ© LÃª Duy (DE180104)
- AI Tool: ChatGPT/Codex
- Purpose: Tham kháº£o cáº£i thiá»‡n UI/UX vÃ  sá»­a lá»—i cuá»™n danh sÃ¡ch phÆ°Æ¡ng tiá»‡n
- Prompt Reference: PROMPTS.md#prompt-23
- AI Output Summary: AI gá»£i Ã½ nguyÃªn nhÃ¢n layout bá»‹ láº¥p do container cha `overflow-hidden`, vÃ¹ng báº£ng dÃ¹ng chiá»u cao chÆ°a Ä‘Ãºng vÃ  pháº§n KPI/filter chiáº¿m nhiá»u viewport.
- Human Decision: Sinh viÃªn tá»± kiá»ƒm tra láº¡i giao diá»‡n thá»±c táº¿, quyáº¿t Ä‘á»‹nh cho tab Vehicles cÃ³ scroll dá»c riÃªng, giá»¯ báº£ng trong panel riÃªng vÃ  chá»‰ dÃ¹ng AI nhÆ° cÃ´ng cá»¥ gá»£i Ã½ cÃ¡ch debug layout.
- Applied To: FRONTEND/src/features/dispatcher/components/tabs/VehiclesTab.tsx, FRONTEND/src/index.css
- Verification: Cháº¡y `npm run build`, má»Ÿ `http://127.0.0.1:3000/dispatcher`, kiá»ƒm tra kÃ©o xuá»‘ng xem danh sÃ¡ch phÆ°Æ¡ng tiá»‡n.

---

## 7. Kiá»ƒm chá»©ng káº¿t quáº£ AI

### Ná»™i dung kiá»ƒm chá»©ng

```text
NhÃ³m cháº¡y thá»­ chÆ°Æ¡ng trÃ¬nh trÃªn mÃ´i trÆ°á»ng phÃ¡t triá»ƒn cá»¥c bá»™ báº±ng lá»‡nh npm run dev. Sau Ä‘Ã³, cÃ¡c thÃ nh viÃªn trá»±c tiáº¿p nháº¥p chuá»™t tÆ°Æ¡ng tÃ¡c trÃªn cÃ¡c tab Ä‘á»ƒ kiá»ƒm tra hiá»ƒn thá»‹ giao diá»‡n, kiá»ƒm tra xem cÃ³ phÃ¡t sinh lá»—i Ä‘á» trÃªn Console cá»§a trÃ¬nh duyá»‡t hay khÃ´ng.
```

---

## 8. ÄÃ³ng gÃ³p cÃ¡ nhÃ¢n hoáº·c Ä‘Ã³ng gÃ³p nhÃ³m

### 8.2. Äá»‘i vá»›i bÃ i nhÃ³m

| ThÃ nh viÃªn | MSSV | Nhiá»‡m vá»¥ chÃ­nh | CÃ³ sá»­ dá»¥ng AI khÃ´ng? | Minh chá»©ng Ä‘Ã³ng gÃ³p |
|---|---|---|---|---|
| VÅ© LÃª Duy | DE180104 | Cáº¥u trÃºc dá»± Ã¡n, Ä‘iá»u hÆ°á»›ng Router chÃ­nh | CÃ³ | [App.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/App.tsx) |
| LÃª Quá»‘c HÃ¹ng | DE180096 | Thiáº¿t láº­p Driver UI, Thá»±c hiá»‡n UC004, UC015, UC018, UC020, UC021 (Full-stack) vÃ  tá»‘i Æ°u Ä‘á»™ tÆ°Æ¡ng pháº£n giao diá»‡n Dispatcher Dashboard | CÃ³ | [Orders.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/admin/Orders.tsx), [VehicleTrackingDashboard.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/dispatcher/pages/VehicleTrackingDashboard.tsx), [GateCheckoutDashboard.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/warehouse/GateCheckoutDashboard.tsx), [VehiclesTab.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/dispatcher/components/tabs/VehiclesTab.tsx) |
| Tráº§n VÄƒn TÃ¹ng | DE180109 | XÃ¢y dá»±ng toÃ n bá»™ giao diá»‡n khÃ¡ch hÃ ng (Customer), há»‡ thá»‘ng xÃ¡c thá»±c (Auth), trung tÃ¢m há»— trá»£ vÃ  voucher | CÃ³ | [AuthPage.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/auth/AuthPage.tsx), [CustomerDashboard.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/customer/CustomerDashboard.tsx) |

---

## 9. Reflection cuá»‘i bÃ i

### 9.1. AI Ä‘Ã£ há»— trá»£ em/nhÃ³m á»Ÿ Ä‘iá»ƒm nÃ o?

```text
AI há»— trá»£ nhÃ³m tÃ¬m hiá»ƒu nhanh cÃ¡c class CSS Tailwind Ä‘á»ƒ dá»±ng giao diá»‡n tÄ©nh vÃ  thiáº¿t láº­p khung layout tá»•ng thá»ƒ.
```

### 9.2. Pháº§n nÃ o em/nhÃ³m khÃ´ng sá»­ dá»¥ng theo gá»£i Ã½ cá»§a AI? VÃ¬ sao?

```text
NhÃ³m khÃ´ng copy cÃ¡c Ä‘oáº¡n code logic Ä‘iá»u phá»‘i phá»©c táº¡p cá»§a AI do khÃ´ng phÃ¹ há»£p vá»›i thiáº¿t káº¿ tá»‘i giáº£n hiá»‡n táº¡i vÃ  gÃ¢y khÃ³ khÄƒn khi tá»± debug lá»—i.
```

### 9.3. Em/nhÃ³m Ä‘Ã£ kiá»ƒm tra tÃ­nh Ä‘Ãºng Ä‘áº¯n cá»§a káº¿t quáº£ AI nhÆ° tháº¿ nÃ o?

```text
Cháº¡y dá»± Ã¡n trÃªn localhost vÃ  trá»±c tiáº¿p nháº¥p chuá»™t thá»­ nghiá»‡m chá»©c nÄƒng trÃªn mÃ n hÃ¬nh.
```

### 9.4. Náº¿u khÃ´ng cÃ³ AI, pháº§n nÃ o sáº½ khÃ³ khÄƒn nháº¥t?

```text
Viá»‡c tra cá»©u cÃ¡c class Tailwind cá»¥ thá»ƒ Ä‘á»ƒ lÃ m giao diá»‡n sáº½ máº¥t nhiá»u thá»i gian hÆ¡n.
```

### 9.5. Sau bÃ i táº­p/project nÃ y, em/nhÃ³m há»c Ä‘Æ°á»£c gÃ¬ vá» mÃ´n há»c?

```text
Hiá»ƒu vá» cÃ¡ch bá»‘ trÃ­ luá»“ng Ä‘iá»u hÆ°á»›ng cá»§a má»™t trang web quáº£n trá»‹ vÃ  cÃ¡ch lÃ m viá»‡c nhÃ³m trÃªn git.
```

### 9.6. Sau bÃ i táº­p/project nÃ y, em/nhÃ³m há»c Ä‘Æ°á»£c gÃ¬ vá» cÃ¡ch sá»­ dá»¥ng AI cÃ³ trÃ¡ch nhiá»‡m?

```text
Nháº­n ra AI chá»‰ lÃ  trá»£ lÃ½ tham kháº£o, má»i Ä‘oáº¡n code do AI gá»£i Ã½ cáº§n Ä‘Æ°á»£c hiá»ƒu rÃµ báº£n cháº¥t trÆ°á»›c khi Ä‘Æ°a vÃ o dá»± Ã¡n Ä‘á»ƒ trÃ¡nh phÃ¡t sinh lá»—i há»‡ thá»‘ng.
```

---

## 10. Cam káº¿t há»c thuáº­t

Sinh viÃªn/nhÃ³m cam káº¿t ráº±ng:

- Ná»™i dung AI há»— trá»£ Ä‘Ã£ Ä‘Æ°á»£c ghi nháº­n trung thá»±c.
- KhÃ´ng ná»™p nguyÃªn vÄƒn káº¿t quáº£ AI mÃ  khÃ´ng kiá»ƒm tra.
- CÃ³ kháº£ nÄƒng giáº£i thÃ­ch cÃ¡c pháº§n Ä‘Ã£ ná»™p.
- Chá»‹u trÃ¡ch nhiá»‡m vá» tÃ­nh Ä‘Ãºng Ä‘áº¯n cá»§a sáº£n pháº©m cuá»‘i cÃ¹ng.
- Hiá»ƒu ráº±ng viá»‡c sá»­ dá»¥ng AI khÃ´ng khai bÃ¡o cÃ³ thá»ƒ áº£nh hÆ°á»Ÿng Ä‘áº¿n káº¿t quáº£ Ä‘Ã¡nh giÃ¡.

| Äáº¡i diá»‡n sinh viÃªn/nhÃ³m | NgÃ y xÃ¡c nháº­n |
|---|---|
| NhÃ³m trÆ°á»Ÿng | 21/06/2026 |

---

## Log #22
- Date: 2026-07-10
- Author: Vu Le Duy (DE180104)
- AI Tool: ChatGPT/Codex
- Purpose: Tham khao hoan thien luong dang nhap theo role va cap nhat UI nghiep vu AI goi y vi tri luu kho.
- Prompt Reference: PROMPTS.md#prompt-25
- AI Output Summary: AI goi y kiem tra `AuthPage.tsx`, `RoleGuard.tsx`, router trong `App.tsx`, API login response va nguyen nhan input email khong cho nhap username.
- Human Decision: Sinh vien tu doc code hien co, quyet dinh dieu huong theo role `ADMIN`, `WAREHOUSE`, `DISPATCHER`, `DRIVER`, sua input login thanh text va cai thien nut goi y vi tri bang style ro rang hon.
- Applied To: FRONTEND/src/features/auth/AuthPage.tsx, FRONTEND/src/App.tsx, FRONTEND/src/features/warehouse/ImportGoods.tsx
- Verification: Test API login voi tai khoan `warehouse` va `dispatcher`, chay `npm run build`, mo frontend localhost de kiem tra luong dang nhap va nut goi y vi tri.

## Log #23
- Date: 2026-07-10
- Author: Vu Le Duy (DE180104)
- AI Tool: ChatGPT/Codex
- Purpose: Tham khao cach cau hinh moi truong local va bao ve thong tin nhay cam trong appsettings.
- Prompt Reference: PROMPTS.md#prompt-26
- AI Output Summary: AI ho tro kiem tra connection string SQL Server local, loi certificate va viec luu cau hinh Azure Vision theo section rieng.
- Human Decision: Sinh vien tu quyet dinh chi ghi nhan cach cau hinh, khong dua secret/key day du vao tai lieu, va kiem tra backend/frontend tren localhost.
- Applied To: BACKEND/appsettings.json, BACKEND/Program.cs, tai lieu docs
- Verification: Backend Swagger tra 200, frontend tra 200, API `/api/inbound` tra 200 trong qua trinh test local.
## Log #24
- Date: 2026-07-10
- Author: Vu Le Duy (DE180104)
- AI Tool: ChatGPT/Codex/Antigravity
- Purpose: Tham khao tich hop Ban do theo doi don hang (Order Tracking Map) voi thu vien Goong Map.
- Prompt Reference: PROMPTS.md#prompt-27
- AI Output Summary: AI ho tro goi y cu phap su dung `rsapi.goong.io/Direction` va cach khoi tao Marker/Polyline bang Mapbox GL JS.
- Human Decision: Sinh vien da tu doc hieu va chi su dung AI nhu tai lieu tham khao. Toan bo logic ve % tiáº¿n trÃ¬nh (progress), cat duong di (slice route) va thiet ke Marker xe tai (Truck SVG) deu do nhom tu quyet dinh va trien khai. Xem chi tiet tai folder `docs/order_tracking_ai_reference`.
- Applied To: FRONTEND/src/features/customer/OrderTracking.tsx
- Verification: Test giao dien tren trinh duyet thanh cong, xe tai va lo trinh the hien dung % mapping voi timeline don hang.



## Log #25
- Date: 2026-07-11
- Author: Vu Le Duy (DE180104)
- AI Tool: Antigravity
- Purpose: Cải thiện thuật toán trích xuất dữ liệu từ Azure Vision OCR cho module Quét Hóa Đơn.
- Prompt Reference: PROMPTS.md#prompt-28
- AI Output Summary: Gợi ý các kỹ thuật nhận diện chuỗi dựa trên substring, regex và xử lý mảng (lines array) để tách chi tiết Số điện thoại, Loại giao hàng, Tên hàng hóa, Giá trị, và Ghi chú từ ảnh hóa đơn thực tế.
- Human Decision: Sinh viên kiểm thử và tinh chỉnh lại các từ khóa điều kiện (vd: 'hỏa tốc', 'nội dung:') cho phù hợp với định dạng hóa đơn vận chuyển tại Việt Nam.
- Applied To: BACKEND/Services/InvoiceOcrService.cs, FRONTEND/src/features/customer/CreateOrder.tsx
- Verification: Đã test upload ảnh hóa đơn qua giao diện React, thông tin được tự động điền đầy đủ và đúng chuẩn vào form tạo đơn hàng.

## Log #26
- Date: 2026-07-11
- Author: Vu Le Duy (DE180104)
- AI Tool: Antigravity
- Purpose: Biến bản đồ mô phỏng tuyến đường thành bản đồ tương tác (Interactive Route MiniMap).
- Prompt Reference: PROMPTS.md#prompt-29
- AI Output Summary: Gợi ý loại bỏ ảnh GIF nét đứt đứng yên (static dashed line map) và sử dụng Leaflet kết hợp OpenStreetMap để render toạ độ trực tiếp của điểm lấy hàng và giao hàng.
- Human Decision: Tích hợp thư viện Leaflet vào Frontend thay thế UI tĩnh trước đó, tạo cảm giác trực quan hơn cho khách hàng.
- Applied To: FRONTEND/src/features/customer/components/RouteMiniMap.tsx, FRONTEND/src/features/customer/CreateOrder.tsx
- Verification: Nhập địa chỉ lấy và giao hàng, bản đồ tự động vẽ đường chim bay kết nối 2 điểm.
