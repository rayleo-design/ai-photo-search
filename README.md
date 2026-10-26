# Photos Search — prototype

An interactive prototype of conversational search in the iPhone Photos app. It was built for the Nielsen design assignment.

**There is no AI.** Every photo carries hand-written tags (people, place, scenes, date) in `data.js`. A spoken or typed query is turned into tags with keyword lists, then matched against the photos. Staged timing, the "Understood …" status line and the orb animation make it feel like a model is working.

## Flow

1. **Search overview.** Tap the search icon in Photos: Recents, People, Places & trips, Documents. Tap any recent, person or place to search it.
2. **Voice search.** Tap the mic. Pick a "Try saying" prompt and it plays back as if spoken. In Chrome or Safari opened directly (not embedded), **Use my voice** uses the browser's free speech recognition instead.
3. **Results.** Chips show what was understood; tap a chip to switch that filter off. Tap a photo to open it.
4. **Unknown person.** The first time you say "mom", Lumi doesn't know who that is. You get a best guess and "Show me".
5. **Tag person.** Pick Mom's face and the names you use for her. The same search then reruns, and "mom" now works.
6. **Save album.** The bookmark next to the chips creates a live album: suggested cover, editable title, auto-add and share toggles.
7. **Not these?** This link on a result opens a refinement menu: Earlier that evening, Near buildings, Closer up, Just two of us, and A different trip. "A different trip" leads to **no results**, with the closest match and other albums.
8. **Refine.** Switch a chip off (for example Mom) to widen to "6 sunset photos from your Italy trip". Tap the search bar to **add to this search**: pick a suggestion or type, e.g. "closer". That gives "1 sunset photo… Narrowed down to closer ups."
9. **Select → Share.** Select picks the photos; the share icon opens the share sheet. It has people, apps, **Keep as an album** and **Live Album**.
10. **Vague search.** "Pic from that thing at Rohan's" → "I know Rohan but not which 'thing'". Pick an event, or tap a memory prompt to add a clue.

The main demo path:

1. Say "Show me sunset photo with mom in Italy".
2. Tap **Show me**, then ✓.
3. Tap **Not these?**, then **Closer up**.
4. Tap **Select**, then **Share**.

Shortcuts: **R** restarts the demo, **Esc** closes sheets. **•••** on results has "Restart demo" and "Forget who Mom is".

## URL options

- `?frame=0` drops the phone bezel and fills the window. Use it for embeds that already show a device frame.

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Photos

The photos are from [Unsplash](https://unsplash.com) and are free to use under the Unsplash License.
