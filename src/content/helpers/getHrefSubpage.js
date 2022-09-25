export default function getHrefSubpage() {
    const href = window.location.href;

    let subpage = href.split('www.youtube.com')[1];

    subpage = subpage.split('?')[0];

    return subpage;
}
