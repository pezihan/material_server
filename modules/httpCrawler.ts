var axios = require('axios') 


module.exports = {
    // 百度图片爬取
    async getBaiduCrawler(keyword: string, pn: number) {
        // 百度图库请求头配置
        const header = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
            // 'Referer': `https://image.baidu.com/search/index?tn=baiduimage&ipn=r&ct=201326592&cl=2&lm=-1&st=-1&fm=index&fr=&hs=0&xthttps=111110&sf=1&fmq=&pv=&ic=0&nc=1&z=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&ie=utf-8&word=${query}`,
            'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
            'Cookie': 'BDqhfp=iu%26%260-10-1undefined%26%262798%26%263; BIDUPSID=38F4EA34D57CC06BF89BCA3CED853608; PSTM=1620036390; BAIDUID=38F4EA34D57CC06B4CA36868E0C846AC:FG=1; H_PS_PSSID=31253_26350; BDORZ=FFFB88E999055A3F8A630C64834BD6D0; __yjs_duid=1_bf05255825084fe4dd18821d0759ec9d1620036420028; firstShowTip=1; indexPageSugList=%5B%22iu%22%5D; cleanHistoryStatus=0; delPer=0; PSINO=3; BDRCVFR[-pGxjrCMryR]=mk3SLVN4HKm; BDRCVFR[dG2JNJb_ajR]=mk3SLVN4HKm; userFrom=null; ab_sr=1.0.0_N2I4MTQ0OTVhYzU2NTY1Y2IyYjg5NGVjMDczOWNlOWI1MTAyOGRmMzY5NTJjZDNjYWY3Y2M3MDgyZDA1MTMyMjc5Y2FiM2QxMmQ0YmVkMWViNzlmNzc0YjdkZTNiMTVk'
        }
        // 百度图库请求参数配置
        const param = {
            tn: 'resultjson_com', logid: 10307720331181765367, ipn: 'rj', ct: '201326592',
            is:'', fp: 'result', queryWord: keyword, cl: 2, lm: -1, ie: 'utf-8', oe: 'utf-8',
            adpicid:'' , st: -1, z: '', ic: 0, hd: '', latest: '', copyright: '', word: keyword, s: '', se: '',
            tab: '', width: '', height: '', face: 0, istype: 2, qc: '', nc: 1, fr: '', expermode: '', force: '',
            cg: 'star', pn: pn, rn: 30, gsm: '1e'
        }
        try {
            const { data } = await axios.get('https://image.baidu.com/search/acjson', {headers: header, params: param})
            if (data.data == undefined) {
                return 'error'
            }
            return data.data
        } catch (err) {
            console.log('百度图片爬取失败', err)
            return 'error'
        }
    },
    // 快手视频爬取
    async getKuaishouCrawler(keyword: string, pcursor: number, searchId: string) {
        let param =  {
            "operationName": "visionSearchPhoto",
            "query": "query visionSearchPhoto($keyword: String, $pcursor: String, $searchSessionId: String, $page: String, $webPageArea: String) {\n  visionSearchPhoto(keyword: $keyword, pcursor: $pcursor, searchSessionId: $searchSessionId, page: $page, webPageArea: $webPageArea) {\n    result\n    llsid\n    webPageArea\n    feeds {\n      type\n      author {\n        id\n        name\n        following\n        headerUrl\n        headerUrls {\n          cdn\n          url\n          __typename\n        }\n        __typename\n      }\n      tags {\n        type\n        name\n        __typename\n      }\n      photo {\n        id\n        duration\n        caption\n        likeCount\n        realLikeCount\n        coverUrl\n        photoUrl\n        liked\n        timestamp\n        expTag\n        coverUrls {\n          cdn\n          url\n          __typename\n        }\n        photoUrls {\n          cdn\n          url\n          __typename\n        }\n        animatedCoverUrl\n        stereoType\n        videoRatio\n        __typename\n      }\n      canAddComment\n      currentPcursor\n      llsid\n      status\n      __typename\n    }\n    searchSessionId\n    pcursor\n    aladdinBanner {\n      imgUrl\n      link\n      __typename\n    }\n    __typename\n  }\n}\n",
            "variables": {
                "keyword": keyword,
                "page": "search",
                "pcursor": pcursor == 0 ? "" : String(pcursor),
                "searchSessionId": searchId == undefined || searchId == "" ? "" : searchId
            }
        }
        var config = {
            method: 'post',
            url: 'https://www.kuaishou.com/graphql',
            headers: { 
              'Content-Type': 'application/json', 
              'Cookie': 'clientid=3; did=web_4e02da3ce5d0df3743301af32901bd84; didv=1621089851000'
            },
            data : JSON.stringify(param)
        };
        try {
            const { data } = await axios(config)
            if (data.data == undefined || data.data.visionSearchPhoto == undefined) {
                return 'error'
            }
            return data.data.visionSearchPhoto
        } catch (err) {
            console.log('快手视频爬取失败', err)
            return 'error'
        }
    }
}