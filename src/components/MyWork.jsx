import CardFanCarousel from "./ui/card-fan-carousel";
import shopCheckout from "../assets/shop-checkout.png";
import flipTheCoin from "../assets/flip-the-coin.png";
import githubBlog from "../assets/github-blog.png";
import imageUpload from "../assets/image-upload.png";

const PROJECTS = [
  {
    imgUrl: shopCheckout,
    alt: "Shop checkout page",
    title: "Shop Checkout",
    linkUrl: "https://github.com/Mathbkj/shop-checkout",
  },
  {
    imgUrl: flipTheCoin,
    alt: "Flip the coin app",
    title: "Flip the Coin",
    linkUrl: "https://github.com/Mathbkj/flip-the-coin",
  },
  {
    imgUrl: githubBlog,
    alt: "GitHub blog profile page",
    title: "GitHub Blog",
    linkUrl: "https://github.com/Mathbkj/github-blog",
  },
  {
    imgUrl: imageUpload,
    alt: "Image upload app",
    title: "Image Upload",
    linkUrl: "https://github.com/Mathbkj/image-upload",
  },
];

function MyWork() {
  return (
    <section className="relative flex w-full shrink-0 flex-col items-center overflow-x-clip py-24">
      <h2 className="m-0 text-7xl text-text-h md:text-9xl">My Work</h2>
      <CardFanCarousel cards={PROJECTS} />
    </section>
  );
}

export default MyWork;
