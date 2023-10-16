const express = require("express");
const router = express.Router();
const WrapAsync = require('../utils/WrapAsync.js');
const ExpressError = require('../utils/ExpressError.js')
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");

const ValidateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


//index route
router.get('/', async(req, res) => {
    const allListings = await Listing.find({});
    res.render('./listings/index.ejs', {allListings});
    }
);


//new route
router.get('/new', (req, res) => {
   res.render('./listings/new.ejs')
    }
); 


//show route
router.get('/:id',  
    WrapAsync(async(req, res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id).populate("reviews");
        if(!listing) {
            req.flash('error', 'Listing you requested for does not exists..');
            res.redirect('/listings');
        };
        res.render('./listings/show.ejs', {listing})
    })
);


//create route
router.post('/', ValidateListing,
    WrapAsync(async(req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash('success', 'New Listing Created');
        res.redirect("/listings");
    })
);


//edit route
router.get('/:id/edit',
    WrapAsync(async(req, res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id);
        if(!listing) {
            req.flash('error', 'Listing you requested for does not exists..');
            res.redirect('/listings');
        };
        res.render('./listings/edit.ejs', {listing})
    })
);


//update route
router.put('/:id', ValidateListing,  
    WrapAsync(async(req, res) => {
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id, {...req.body.listing});
        req.flash('success', 'Listing Updated');
        res.redirect(`/listings/${id}`);
    })
);


//delete route
router.delete('/:id',  
    WrapAsync(async(req, res) => {
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash('success', 'Listing Deleted!');
        res.redirect('/listings');
    })
);

module.exports = router;