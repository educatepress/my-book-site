// /assets/author-inject.js
// /note/ /note-en/ 配下のページだけに著者カードを末尾挿入
(function () {
  try {
    var path = location.pathname || '';

    // 先に /note-en/ を判定する（/note/ で誤検知しないように）
    var isNoteEn = path.indexOf('/note-en/') === 0;
    var isNoteJa = !isNoteEn && path.indexOf('/note/') === 0;

    if (!isNoteEn && !isNoteJa) return;

    // 言語別に読み込む author-card
    var cardUrl = isNoteEn
      ? '/assets/author-card-en.html?v=1'
      : '/assets/author-card.html?v=1';

    // LP 戻りリンクのURLも言語別
    var backHtml = isNoteEn
      ? '<a href="/book-landing-en.html#en-articles">← Back to English LP</a>'
      : '<a href="/#related-articles">← 公式LPへ戻る</a>';

    fetch(cardUrl, { cache: 'no-store' })
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        // すでに LPへ戻る リンクが無い場合は追加
        var backLinkExists = document.querySelector(
          isNoteEn
            ? 'a[href="/book-landing-en.html#en-articles"]'
            : 'a[href="/#related-articles"], a[href="/"]'
        );
        if (!backLinkExists) {
          var p = document.createElement('p');
          p.style.margin = '18px 0 0';
          p.innerHTML = backHtml;
          document.body.insertBefore(p, container);
        }
      })
      .catch(function (e) {
        console.warn('author inject failed', e);
      });
  } catch (e) {
    console.warn('author inject init error', e);
  }
})();
