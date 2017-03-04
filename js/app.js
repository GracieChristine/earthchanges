$().ready(() => {

    let button = $('#button');
    let date = $('#date');
    let latLng = [];
    let apiKey = "2p2USK4aZhtiwAaABdwKhUaA0pRny8rBWYvHOFT7";
    let imageArr = [];
    let gifParts = [];

    // Map Section
    const createMap = (() => {
        var galvanize = {
            lat: 39.75722016211172,
            lng: -105.00311851501465
        };
        var map = new google.maps.Map(document.getElementById("map"), {
            zoom: 4,
            center: galvanize
        });
        // let marker = new google.maps.Marker({
        //     position: galvanize,
        //     map: map,
        //     title: "Galvanize - Platte"
        // });



        google.maps.event.addListener(map, "click", function(event) {
            imageArr = [];
            gifParts = [];
            let latitude = event.latLng.lat()
            let longitude = event.latLng.lng()
            let myLatLng = event.latLng
            console.log("Latitude: " + event.latLng.lat() + " " + ", longitude: " + event.latLng.lng());
            console.log([`${latitude}`, `${longitude}`]);
            latLng.push(`${latitude}`, `${longitude}`);
            let marker1 = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: 'Selected Location'
            });
        });
    })()




    Date.prototype.addDays = function(days) {
        let dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    let populatePage = () => {
        console.log(imageArr);
        for (let i = 0; i < imageArr.length; i++) {
            if (imageArr[i].cloud_score < 0.3) {
                gifParts.push(imageArr[i].url);
                // imageArea.append(`<img src="${imageArr[i].url}">`)
            }
        }
        // Gif Section
        gifshot.createGIF({
            "images": gifParts,
            "interval": 0.5,
            "gifWidth": 512,
            "gifHeight": 512
        }, function(obj) {
            if (!obj.error) {
                var image = obj.image
                var animatedImage = document.createElement("img");

                animatedImage.src = image;
                $("#earth-images").append(animatedImage);
            }
        });
    }


    let callNasa = (dates, latLon) => {
        // console.log(dates, latLon);
        $.ajax({
            method: "GET",
            url: `https://api.nasa.gov/planetary/earth/assets?lon=${latLon[1]}&lat=${latLon[0]}&begin=${dates[0]}&end=${dates[1]}&api_key=${apiKey}`,
            success: (data) => parseDates(data),
            error: () => console.log("error")
        });
    }

    let getDates = () => {
        let changeDate = (old) => {
            console.log(old);
            let arr = old.split("-");
            let nArr = [];
            let newD = new Date(arr[0], arr[1], arr[2]);
            // console.log(newD);
            newD = newD.addDays(3650);
            // console.log(newD);
            nArr.push(newD.getUTCFullYear(), newD.getUTCMonth(), newD.getUTCDate() + 1);
            return `${nArr[0]}-${nArr[1]}-${nArr[2]}`
        }
        let dateParsed = date.val().replace(/\s/, "-");

        let endDate = changeDate(dateParsed)
        // console.log([dateParsed, endDate]);
        callNasa([dateParsed, endDate], latLng);
    }

    let parseImage = (imageObj, i) => {
        imageArr[i] = imageObj;

    }

    let getImages = (dates) => {
        let deferreds = [];
        $.each(dates, (i) => {
            let date = dates[i];
            deferreds.push(
                $.ajax({
                    method: "GET",
                    url: `https://api.nasa.gov/planetary/earth/imagery?lon=${latLng[1]}&lat=${latLng[0]}&date=${date}&cloud_score=True&api_key=${apiKey}`,
                    success: (data) => parseImage(data, i),
                    error: () => console.log("error")
                })
            )
        })
        $.when.apply($, deferreds).then(() => {
            populatePage();
        })
    }

    let parseDates = (dateData) => {
        console.log(dateData);
        let tempDates = [];
        let datesToGetImg = [];
        let dateObjects = dateData.results;
        for (let dater of dateObjects) {
            tempDates.push(dater.date.match(/\d\d\d\d-\d\d-\d\d/)[0]);
        }
        datesToGetImg.push(tempDates[0], tempDates[1], tempDates[2]);
        for (let i = 3; i < tempDates.length; i++) {
            if (i % (Math.floor(tempDates.length / 10)) === 0) {
                datesToGetImg.push(tempDates[i]);
            }
        }
        console.log(datesToGetImg);
        getImages(datesToGetImg);
    }

    button.click(() => getDates());

});
