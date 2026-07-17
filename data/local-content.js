/**
 * 地域コンテンツの静的フォールバック
 * 通常はスプレッドシート「地域コンテンツ」→ GAS(action=local) から配信される。
 * この配列は GAS 取得に失敗し localStorage キャッシュも無いときだけ使われる保険。
 * 形式は GAS の items と同じ:
 *   { id, kind:'event'|'school'|'ad', title, desc, cities:['所沢市'] or ['全県'],
 *     dateText, url, img, sponsor, lat, lng, priority, start }
 */
const localContentStatic = [];
