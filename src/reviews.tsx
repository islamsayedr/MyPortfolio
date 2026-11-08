export const testimonials = [
  ['Islam created a professional, tailor-made design. His creativity and communication are excellent. I really recommend working with him.', 'Matt G.', '/icons/pl.svg', 'Poland'],
  ['I really enjoyed working with Islam. He addressed my requirements carefully and was very attentive to my requests.', 'Mehrdad D.', '/icons/australia-flag-icon.svg', 'Australia'],
  ['He was super helpful, professional, and delivered beautiful, elegant designs right on target.', 'Cameron F.', '/icons/mexico-flag-icon.svg', 'Mexico'],
]

export function ReviewCard({ review }: { review: typeof testimonials[number] }) {
  const [quote, name, flag, country] = review
  return <article className="testimonial-card"><span className="testimonial-mark" aria-hidden="true">“</span><div className="testimonial-rating" aria-label="Rated 5 out of 5"><span aria-hidden="true">★★★★★</span><span>5.0 / 5</span></div><blockquote className="testimonial-quote"><p>{quote}</p></blockquote><div className="testimonial-author"><span className="client-avatar" aria-hidden="true">{name.charAt(0)}</span><div><strong>{name}</strong><span className="client-country"><img src={flag} alt="" />{country}</span></div></div></article>
}
