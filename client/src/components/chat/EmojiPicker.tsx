import { useState } from "react"

const emojiCategories: { name: string; emojis: string[] }[] = [
  {
    name: "Smileys",
    emojis: ["😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","😮","😯","😲","😳","🥺","😢","😭","😤","😠","😡","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"],
  },
  {
    name: "Gestures",
    emojis: ["👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✌️","🤞","🤟","🤘","🤙","👋","🤚","✋","👌","🤌","🤏","🖐️","✍️","💅","👀","👁️","👄","👅","🫶","🫵","🫱","🫲","🫳","🫴"],
  },
  {
    name: "Hearts",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💕","💞","💗","💖","💘","💝","💟","❣️","💔","❤️‍🔥","❤️‍🩹","💯","💢","💥","💫","💦","💨"],
  },
  {
    name: "Objects",
    emojis: ["🔥","⭐","🌟","✨","💡","📚","📖","📝","✏️","🖊️","📎","🔗","📌","📍","✂️","🎁","🎈","🎉","🎊","🎀","🪄","🔮","💎","👑","🎯","🏆","🥇","🥈","🥉","🏅"],
  },
  {
    name: "Food",
    emojis: ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥝","🍅","🥑","🥦","🥬","🥒","🌽","🥕","🧄","🧅","🥔","🍠","🥐","🍞","🥖","🥨","🧀","🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🥪","🥙","🧆","🌮","🌯","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯","🍼","🥛","☕","🫖","🍵","🍶","🍺","🍻","🥂","🍷","🫗","🥃","🍸","🍹","🧉","🧊"],
  },
  {
    name: "Nature",
    emojis: ["🌸","🌺","🌻","🌹","🥀","🌷","🌿","🍀","🌱","🌳","🌲","🌵","🌾","🌴","🪴","🍄","🐚","🐌","🐛","🦋","🐝","🐞","🦗","🪲","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🪼","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔","🐾","🐉","🐲","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌎","🌍","🌏","🪐","💫","⭐","🌟","✨","⚡","☄️","💥","🔥","🌪️","🌈","☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","💧","💦","🫧","☔","☂️","🌊","🌫️"],
  },
]

interface EmojiPickerProps {
  onEmoji: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onEmoji, onClose }: EmojiPickerProps) {
  const [category, setCategory] = useState(0)

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-off-white rounded-xl shadow-xl border border-gray/20 w-72 z-50" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-light-gray overflow-x-auto">
        {emojiCategories.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setCategory(i)}
            className={`text-xs px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${i === category ? "bg-dark-purple text-off-white" : "text-dark-purple/50 hover:bg-light-gray"}`}
            aria-label={cat.name}
          >{cat.emojis[0]}</button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-0.5 p-2 max-h-48 overflow-y-auto">
        {emojiCategories[category].emojis.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => { onEmoji(emoji); onClose() }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-light-gray rounded-lg transition-colors"
            aria-label={emoji}
          >{emoji}</button>
        ))}
      </div>
    </div>
  )
}