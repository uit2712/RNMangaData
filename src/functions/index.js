

export function getAllMangaNamesFromAnimeNewsNetwork() {
    const url = 'https://www.animenewsnetwork.com/encyclopedia/ratings-manga.php?top50=popular&n=1000';
    let req = new XMLHttpRequest();

    req.open('GET', url, false);
    req.send(null);

    if(req.status == 200) {
        let htmlObject = document.createElement('div');
        htmlObject.innerHTML = req.responseText;

        let result = [];
        htmlObject.querySelectorAll('[bgcolor="#EEEEEE"]').forEach((item) => {
            Array.from(item.getElementsByTagName('a')).forEach((a) => {
                if (a.textContent !== null) {
                    result.push(a.textContent.replace(/ *\([^)]*\) */g, '').trim());
                }
            });
        });
        console.log(JSON.stringify(result));
    }
}

export function getMangasName(
    from = 0,
    to = 10
) {
    const manga_names = require("../mock_data/manga_names.json");
    return manga_names.slice(from, to);
}

export function getMangasInfoFromTruyenqq(
    from = 0,
    to = 10
) {
    return new Promise((resolve, reject) => {
        const manga_names = getMangasName(from, to);
        const resultPromises = [];
        manga_names.forEach(manga_name => {
            resultPromises.push(getMangaInfoFromTruyenqq(manga_name));
        });

        Promise.all(resultPromises).then(result => resolve(result));
    })
}

export function getMangaInfoFromTruyenqq(mangaName) {
    return new Promise((resolve, reject) => {
        const url = `http://truyenqq.com/tim-kiem.html?q=${mangaName}`;
        fetch(url)
        .then((response) => response.text())
        .then((text) => {
            let result = null;
            let htmlObject = document.createElement('html');
            htmlObject.innerHTML = text;
    
            let moreInfoEls = htmlObject.getElementsByClassName('more-info');
            if (moreInfoEls != null && moreInfoEls.length > 0) {
                let moreInfoEl = Array.from(moreInfoEls)[0];
                let title = Array.from(moreInfoEl.getElementsByClassName('title-more'))[0]?.innerHTML;
                let otherTitles = Array.from(moreInfoEl.getElementsByClassName('title-more-other'))[0]?.innerHTML?.replace('Tên khác: ', '').split('; ');
                let status = Array.from(moreInfoEl.getElementsByClassName('info'))[0]?.innerHTML?.replace('Tình trạng: ', '');
                let genre = [];
                Array.from(moreInfoEl.getElementsByClassName('blue')).forEach((el) => {
                    genre.push(el.innerHTML);
                })
                result = {
                    title,
                    otherTitles: !otherTitles ? [] : otherTitles,
                    status,
                    genre,
                };
            }
            resolve(result);
        })
    })
}

// start from 22->24
export function getAllActionMangasInfoFromNettruyen({
    from = 1,
    to = 3,
}) {
    return new Promise((resolve, reject) => {
        let resultPromise = [];
        for(let i = from; i <= to; i++) {
            resultPromise.push(getMangasInfoFromNettruyen(i));
        }

        Promise.all(resultPromise).then(result => {
            resolve([].concat.apply([], result));
        }).catch((error) => reject);
    })
}

export function getMangasInfoFromNettruyen(pageNumber = 1) {
    return new Promise((resolve, reject) => {
        const url = `http://www.nettruyen.com/tim-truyen/action?status=-1&sort=10&page=${pageNumber}`;

        fetch(url)
        .then((response) => response.text())
        .then(text => {
            let result = [];
            let htmlObject = document.createElement('html');
            htmlObject.innerHTML = text;

            let itemEls = Array.from(htmlObject.getElementsByClassName('item'));
            if (itemEls.length > 0) {
                itemEls.forEach((el) => {
                    let id = result.length + 1;
                    let detailLink = '';
                    let imageEl = Array.from(el.getElementsByClassName('image'))[0];
                    if (imageEl) {
                        detailLink = Array.from(imageEl.getElementsByTagName('a'))[0]?.href;
                        id = Number(detailLink.substr(detailLink.lastIndexOf('-') + 1));
                    }
                    let title = Array.from(el.getElementsByClassName('title'))[0]?.innerHTML.trim();
                    let description = Array.from(el.getElementsByClassName('box_text'))[0]?.innerHTML.trim();
                    let others = Array.from(Array.from(el.getElementsByClassName('message_main'))[0]?.getElementsByTagName('p'));
                    
                    let otherNames = [];
                    let genre = [];
                    let author = '';
                    let status = '';
                    let viewCount = 0;
                    others.forEach(o => {
                        let innerText = o.innerText.trim();
                        if (o.innerText.includes('Tên khác:')) {
                            otherNames = innerText.replace('Tên khác:', '').split('; ');
                        }

                        if (o.innerText.includes('Thể loại:')) {
                            genre = innerText.replace('Thể loại:', '').split(', ');
                        }

                        if (o.innerText.includes('Tác giả:')) {
                            author = innerText.replace('Tác giả:', '');
                        }

                        if (o.innerText.includes('Lượt xem:')) {
                            viewCount = Number(innerText.replace('Lượt xem:', '').replace(/[.]/g, ''));
                        }

                        if (o.innerText.includes('Tình trạng:')) {
                            status = innerText.replace('Tình trạng:', '');
                        }
                    });

                    if (genre.length > 0) {
                        result.push({
                            id,
                            title,
                            detailLink,
                            otherNames,
                            genre,
                            author,
                            status,
                            description,
                            viewCount,
                        });
                    }
                })
            }
            resolve(result);
        })
    })
    
}