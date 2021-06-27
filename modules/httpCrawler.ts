var axios = require('axios') 


module.exports = {
    // 百度图片爬取
    async getBaiduCrawler(keyword: string, pn: number) {
        // 百度图库请求参数配置
        const param = {
            tn: 'resultjson_com', logid: 10964516230652228249, ipn: 'rj', ct: '201326592',
            is:'', fp: 'result', queryWord: keyword, cl: 2, lm: -1, ie: 'utf-8', oe: 'utf-8',
            adpicid:'' , st: -1, z: '', ic: 0, hd: '', latest: '', copyright: '', word: keyword, s: '', se: '',
            tab: '', width: '', height: '', face: 0, istype: 2, qc: '', nc: 1, fr: '', expermode: '', force: '',
            cg: 'star', pn: pn, rn: 30, gsm: '1e'
        }
        // 百度图库请求头配置
        const header = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Referer': `https://image.baidu.com/search/index?tn=baiduimage&ipn=r&ct=201326592&cl=2&lm=-1&st=-1&fm=result&fr=&sf=1&fmq=1624811122623_R&pv=&ic=0&nc=1&z=&hd=&latest=&copyright=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&ie=utf-8&sid=&word=%E6%AC%A7%E9%98%B3%E5%A8%9C%E5%A8%9C`,
            'sec-ch-ua': 'Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90',
            'Cookie': 'winWH=%5E6_1536x731; BDIMGISLOGIN=0; BDqhfp=iu%26%260-10-1undefined%26%261848%26%263; BIDUPSID=C1336948F1D7D97BFA857FAAE756E300; PSTM=1622975929; BAIDUID=C1336948F1D7D97BE4CB9ADB3C799F8B:FG=1; __yjs_duid=1_7a34d312e5c9e69c1da6837dc4a26f381623029890114; indexPageSugList=%5B%22iu%22%5D; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; BDSFRCVID_BFESS=dw-OJeC62x57iiReFdXpKIauZ2ddxfRTH6aoM8jxVCLdgV_NGdc7EG0PVf8g0Kub1DMtogKKLmOTHpKF_2uxOjjg8UtVJeC6EG0Ptf8g0f5; H_BDCLCKID_SF_BFESS=tJIJ_ID2JCD3enTmbt__-P4DeUOfexRZ5mAqotPaJbTEVR5Dbh72yUF_5JCHKP3O5HrnaIQqahCWj4nKLUvfbpKmX4Jb55b43bRT-JLy5KJvfJ_lQMcMhP-UyPvLWh37-g3lMKoaMp78jR093JO4y4Ldj4oxJpOJ5JbMonLafJOKHICRDjDMDf5; H_PS_PSSID=33764_34073_33607_34107_34135_34094_26350; BDRCVFR[X_XKQks0S63]=mk3SLVN4HKm; userFrom=www.baidu.com; firstShowTip=1; cleanHistoryStatus=0; BDRCVFR[dG2JNJb_ajR]=mk3SLVN4HKm; BDRCVFR[tox4WRQ4-Km]=mk3SLVN4HKm; BDRCVFR[-pGxjrCMryR]=mk3SLVN4HKm; BDRCVFR[CLK3Lyfkr9D]=mk3SLVN4HKm; ab_sr=1.0.1_ZmMyZjY2ZGNhODI3MGNmMzRlNzRjOGI5N2I0ZmU5YmRlZDM1ODVhNGQyYmVmZjNlNWNhMGIzNmNiODllMTkwZDRiZDI1OTAyMzE1OTMwNjM5NzQ3MThmYTc4MWJlNTBiOWM3YTk2OWM1OTIwZWJiZjUzODMyNjc2MTc5ZWQ0YTU1OTFmZGY5ODcxOTc3NzBmNjM4YmU4ODViOGY0NzhlYg==',
            'X-Requested-With': 'XMLHttpRequest'
        }
        try {
            const { data } = await axios.get('https://image.baidu.com/search/acjson', {headers: header, params: param})
            if (data.data == undefined) {
                console.log('百度图片爬取失败',data);
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
                console.log('快手视频爬取失败', data)
                return 'error'
            }
            return data.data.visionSearchPhoto
        } catch (err) {
            console.log('快手视频爬取失败', err)
            return 'error'
        }
    }
}