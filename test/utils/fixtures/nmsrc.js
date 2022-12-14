module.exports = {
    "sandbox": {
        "active": true,
        "from": {
            "name": "Edgar Allan Poe",
            "email": process.env.EMAIL_FROM
        },
        "to": {
            "name": "John Doe",
            "email": process.env.EMAIL_TO
        }
    },
    "consumer": {
        "company": "My Company",
        "domain": "https://www.my-company.com",
        "addresses": {
            "from": {
                "name": "John Doe",
                "email": "info@john.doe.com"
            },
            "replyTo": {
                "name": "John Doe",
                "email": "info@john.doe.com"
            }
        },
        "location": {
            "street": "Baker street",
            "num": "221B",
            "zip": "NW1 6XE",
            "city": "Marylebone",
            "country": "United Kingdom"
        },
        "email": "contact@john-doe.com",
        "phone": "+44 20 7224 3688",
        "socials": [
            { "name": "github", "url": "https://github.com/pchchv/nms" }
        ]
    },
    "mode": {
        "smtp": {
            "host": process.env.SMTP_HOST,
            "port": 587,
            "secure": false,
            "username": process.env.SMTP_USERNAME,
            "password": process.env.SMTP_PASSWORD
        }
    }
}