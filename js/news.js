// ICMT 2027 news. Edit this list only: it feeds the news strip under the menu on every page,
// the NEWS card on the home page (latest 3 only) and the full list on news.html. Newest first. One entry per date; put same-day
// updates in the same entry. "text" may contain links (<a href="...">...</a>).
const ICMT_NEWS = [
  {
    date: "2026-11-26",
    text: 'The <a href="conference-venue.html#transportation">transportation guide</a> has been updated. Past announcements are now collected on the <a href="news.html">News</a> page.',
  },
  {
    date: "2026-11-24",
    text: 'Conference Venue page is online, with a campus map, a <a href="conference-venue.html#transportation">transportation guide</a> and <a href="conference-venue.html#visa">visa &amp; entry information</a> for international participants.',
  },
  {
    date: "2026-11-23",
    text: '<a href="index.html#dates">Important Dates</a>, 15 <a href="authors-information.html">Conference Topics</a> and the Call for Special Sessions with a proposal template released.<br>The National Center for Instrumentation Research (NCIR) joins ICMT 2027 as co-host.',
  },
  {
    date: "2026-11-02",
    text: 'Conference dates confirmed: 27–30 October 2027 at National Taipei University of Technology. Updated <a href="authors-information.html">Call for Papers flyer</a> available.',
  },
  {
    date: "2026-10-20",
    text: "The official ICMT 2027 website is launched.",
  },
];

(function () {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmt(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return d + " " + MONTHS[m - 1] + " " + y;
  }
  function plain(html) {
    const t = document.createElement("div");
    t.innerHTML = html.replace(/<br\s*\/?>/gi, " ");
    return t.textContent;
  }
  if (!ICMT_NEWS.length) return;
  const latest = ICMT_NEWS[0];

  // Strip under the menu on every page (<div class="news-strip" data-news-strip></div>).
  // It appears only on the first page view after a new item is added: the date of the
  // latest item is remembered in this browser (localStorage, no cookie, nothing sent anywhere).
  // Visitors can also close it with the x button. Adding a newer item shows it again.
  var KEY = "icmt2027-news-seen";
  var seen = null;
  try { seen = localStorage.getItem(KEY); } catch (e) {}
  function markSeen() { try { localStorage.setItem(KEY, latest.date); } catch (e) {} }

  if (seen !== latest.date) {
    document.querySelectorAll("[data-news-strip]").forEach(function (strip) {
      strip.innerHTML =
        '<div class="container news-strip-inner">' +
        '<span class="news-tag">NEWS</span>' +
        '<time class="news-strip-date" datetime="' + latest.date + '">' + fmt(latest.date) + "</time>" +
        '<a class="news-strip-text" href="news.html"></a>' +
        '<a class="news-strip-all" href="news.html">ALL NEWS</a>' +
        '<button class="news-strip-close" type="button" aria-label="Close news">&times;</button>' +
        "</div>";
      strip.querySelector(".news-strip-text").textContent = plain(latest.text);
      strip.querySelector(".news-strip-close").addEventListener("click", function () {
        strip.innerHTML = "";
      });
    });
    markSeen();
  }

  // News lists (<ol class="news-list" data-news-list></ol>). Add data-news-limit="3" to show
  // only the latest items (home page); without it the whole list is shown (news.html).
  document.querySelectorAll("[data-news-list]").forEach(function (list) {
    var limit = parseInt(list.getAttribute("data-news-limit"), 10);
    var items = limit > 0 ? ICMT_NEWS.slice(0, limit) : ICMT_NEWS;
    list.innerHTML = items.map(function (n, i) {
      return (
        '<li class="news-item' + (i === 0 ? " is-new" : "") + '" id="news-' + n.date + '">' +
        '<time datetime="' + n.date + '">' + fmt(n.date) + "</time>" +
        "<p>" + n.text + "</p></li>"
      );
    }).join("");
  });
})();
