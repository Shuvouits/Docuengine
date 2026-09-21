/**
 * Pool Pilots Google Reviews
 * Professional responsive review carousel
 *
 * Shortcode:
 * [pool_pilots_google_reviews]
 */

if (!defined('ABSPATH')) {
    exit;
}

add_shortcode('pool_pilots_google_reviews', function () {

    $reviews = [

    [
    'name' => 'Patricia Hochhaus',
    'count' => '4 reviews',
    'time' => '17 hours ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjU8vgs-X6-JuFuJ_1NPaTbB21Jz8q8ebWLHVfedG8OT871BlOk=w43-h43-p-rp-mo-br100',
    'text' => 'We started using Pool Pilots early in the summer when we were going on a two month holiday and our pool was unmanageable do to a large amount of plant matter getting in the pool. Hard to maintain! Pool Pilots turned the pool around to perfect balance in a day, and maintained it excellently. I also asked for an evaluation of the system, and they next fixed all leaks in valves so the pool and spa have NO air at all making its way to the spa, and they reprogrammed the system and its spillway to run autonomously so we save time and money on water. Very happy to have Pool Pilots on board!'
],


[
    'name' => 'Shauna Fox',
    'count' => '7 reviews',
    'time' => 'a day ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocLnwvYBy3jryx2kyPcILmZzjjU4jtDTi-tiBnyPpcKeNUctEQ=w43-h43-p-rp-mo-br100',
    'text' => 'I love Pool Pilots! Great job, great prices, reliable'
],



[
    'name' => 'Stacey Miller',
    'count' => '',
    'time' => 'a day ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocKFijTWYu08znlA0tgxKgsLF1OGNzwIE-qCfDO6tIpNIozqJA=w43-h43-p-rp-mo-br100',
    'text' => '',
    'price' => 'Reasonable price'
],



[
    'name' => 'Matthew Shahin',
    'count' => 'Local Guide · 19 reviews · 1 photo',
    'time' => '2 days ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjWFvGp8RQ2cYCkJJhin9LRV5w_GQb8L88IzjROnZqb3kfhWUTns=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'I recently hired Pool Pilots to take care of my pool, and I couldn’t be happier with the service. I purchased a new home and was unfamiliar with the pool system, but they took the time to walk me through everything and make sure I understood how it worked.

They are extremely reliable and professional, consistently arriving on the same day and within the same time frame each week. Their pricing is very reasonable, and they do a great job maintaining the pool and keeping everything running properly.

I also really appreciate their weekly email updates, which include pictures and a summary of the work and services completed on the property. It gives me peace of mind knowing the pool is being properly maintained even when I’m not there to see it myself.'
],



[
    'name' => 'luna ochoa',
    'count' => '9 reviews',
    'time' => '2 days ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjXfyrcXGY3vjVxGwq_ySxPFMBOu9Q4ZYUWyx5kMYDEpgaYxNtk4=w43-h43-p-rp-mo-br100',
    'text' => 'The team is extremely knowledgeable and helpful whenever I call in with questions about my pool. It\'s nice that a company still answers their phones and provides old fashioned customer service (zero AI Crap!)!'
],


[
    'name' => 'David Caminiti',
    'count' => 'Local Guide · 15 reviews · 3 photos',
    'time' => '3 weeks ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocKQJpBD25Bqg2l-wkJcRTRGAt-nTltFIMm23DTvTOjFasPVF8M=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'Got in touch with Danny because I was having a pool problem. They explained in detail what my pool readings meant and possible solutions - even went as far as to call other businesses to get me quotes without trying to sell me anything. Genuinely kind and helpful people! Would recommend!'
],





        [
            'name' => 'Jacob Foster',
            'count' => '3 reviews · 1 photo',
            'time' => 'a month ago',
            'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjUviDWxxea5yI8n1l0a_bU04rEA6IRqv8f4Cu8zCdwz2wXx0ss8=w43-h43-p-rp-mo-ba12-br100',
            'text' => 'Pool Pilots is a great company in Scottsdale. I love dealing with them. These guys have been keeping our pool sparkling clean and just saved the day when our pump gave up mid-summer. They came out fast, figured it out quickly, and had us back in the water right away. Scheduling is very easy, pricing is transparent, and the crew is always on time and a pleasure to deal with. I highly recommend anyone looking for pool service to use this company. You won\'t regret it. Thanks, Pool Pilots!!'
        ],


        [
    'name' => 'Brandon Cusson',
    'count' => '2 reviews',
    'time' => '2 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocK2YgrOv46o179vc5x2g_krqLoMCOG7P0r2dJc0-gj-tDXapA=w43-h43-p-rp-mo-br100',
    'text' => 'Wonderful team with great customer service. Quick to respond and fast to act.'
],



[
    'name' => 'Donna Donahue',
    'count' => 'Local Guide · 64 reviews · 82 photos',
    'time' => 'Edited 2 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjXGZwhSNahcm4u2jAdBOEzkJLRRokU0vRJKYgB5dgtOuQ2WU1Znsw=w43-h43-p-rp-mo-ba12-br100',
    'text' => '**Edit**
I left the review a few months ago about the terrible service we were getting on our pool. After several calls to them we sorted out the issues, and it was a case of keeping on someone who probably should have been kept. So I\'m editing my review to state that Pool Pilots truly gave me the best pool cleaning service in Mesa. They completely turned things around. We talked to other pool companies, but rather than just giving up on them we gave them a chance to make it right and they did! We have invested a lot of money into our pool and I am now confident that we do have a company that does care. Thank you Pool Pilots.'
],


         [
        'name' => 'Benjamin Simmonite',
        'count' => '2 reviews · 1 photo',
        'time' => '3 months ago',
        'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocLqXEAKHBB0HLjkqEb5JEMnQo4K2LlzSTxkD1JD9ayahup980A=w43-h43-p-rp-mo-br100',
        'text' => 'Great experience with Pool Pilots, from quickly coming out to repair a damaged pipe and helping to resolve issues left by my previous “service” provider. They also provided good information regards my system. i was so happy with the repair and cost that I decided to hire them as my ongoing service provider. Would definitely recommend to Friends and Family.'
    ],

    [
    'name' => 'Carol G.',
    'count' => 'Local Guide · 20 reviews · 19 photos',
    'time' => '4 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjUWDWqJmsJjCfNBXSFBtI-pRvE8TWFoTX_-QzZdOOeUBzijb_bs=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'I have been so happy with Pool Pilots service. I have been with them for about 4 years now. Demetrius is our pool service person and I love how respectful he. I highly recommend this company for pool service.'
],


[
    'name' => 'D',
    'count' => 'Local Guide · 27 reviews · 32 photos',
    'time' => '5 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjW8tEy6SL1cRg3mPA9dImjnIplQ0hMQwVzK1trbVGICj5W3HP1SwQ=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'Pool Pilots has done a great job at my Airbnb rental in Scottsdale! I never have to worry about my water looking murky like it did with my last company. Would for sure recommend to others.'
],

[
    'name' => 'Barb Dueck',
    'count' => '12 reviews',
    'time' => '3 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjWBrQscXuIY02uTaQjCHBCDjgItFufrag1bUgFp2-1wg0dggM_D=w43-h43-p-rp-mo-br100',
    'text' => 'I have used Pool Pilots for several years and have always found them to be responsive, proactive, and personable. They have been a life-saver on more than one occasion. They take pride in what they do. I highly recommend using this company for all your pool serving needs.'
],

[
    'name' => 'Amanda Shugart',
    'count' => '3 reviews',
    'time' => '4 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjXuipPAo2kj6oug6EcD9hlY1KY8tmNl5wk9tt7yUxNv-DzkEsZb=w43-h43-p-rp-mo-br100',
    'text' => 'This company is amazing! They are quick to respond, and by far the most reasonably priced companies in the Valley with TOP QUALITY!! First off they measured my pool over the phone and told me the exact gallons 🤯 then they gave me 3 different packages to choose from! They are so much different than the rest!! We love Pool Pilots!'
],

[
    'name' => 'Romaine Tiger Rensch',
    'count' => '9 reviews',
    'time' => '2 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjW-RiQyLtaClE8ZhCyHxz0S2s2Bg6qhoReuFZs0xYfZVVwTt0a9=w43-h43-p-rp-mo-br100',
    'text' => 'I went through three pool guys before finding this team, and I’ve never turned back. Excellent customer service, attention to detail and they are truly knowledgeable, that has not been the case with other companies I’ve used. They are also very proactive and try to get out ahead of things, great communication. I have referred friends and family to them and will continue to do so. If you don’t want to worry about your pool anymore I would give them a try. Set it and forget it, one last thing on the to-dos for this guy!'
],


[
    'name' => 'Mamamia',
    'count' => '14 reviews',
    'time' => '4 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocLfoENEyKnyedYIHzm33dIoklt43fKNKqlofibgWw0yOxpcXA=w43-h43-p-rp-mo-br100',
    'text' => 'We have been customers of pool Pilots for several years, without any issues, they have the most wonderful and respectful employees, most recently Brayden has been coming and he has been great, he goes above and beyond and is super friendly, highly recommend this company!'
],


[
    'name' => 'Caitlin Thayer',
    'count' => 'Local Guide · 14 reviews',
    'time' => '6 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocJG8FNSnzZR_4B293jtpgKonqOOLHUkarc1rjgkDoEo-foQNw=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'Can’t recommend Pool Pilots enough!! We have had so many companies service our pool but they wouldn’t do thorough inspections, which cost us a lot of money in repairs over the years. We are so impressed with Pool Pilots - they don’t miss a thing and make owning a pool stress free!'
],


[
    'name' => 'Curt Weller',
    'count' => '15 reviews',
    'time' => 'Edited 4 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjXWjkubirZBUfQYPHQK_JHy44QZYoVeNVjmI-iKfPEZG2wI-Uw=w43-h43-p-rp-mo-br100',
    'text' => 'Great service so far. Regular cleaning is great and very capable on equipment repairs. Consistent and good attention to details. Demetrius is terrific on communication each week as well! Highly recommend them.'
],

[
    'name' => 'Gibby Gear',
    'count' => '5 reviews · 1 photo',
    'time' => '4 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjXIGbiOfKofDNMAiI9udJz1xforPVAxDF-jIueby-K8a36I_IH8=w43-h43-p-rp-mo-br100',
    'text' => 'I texted Pool Pilots yesterday, Thursday 4/23/26, to express a concern regarding my pool pump taking in too much air. Within several hours, someone was out to fix the problem at no charge!! Who does that!?! That is great customer service. I appreciate the service because I am leaving town and was concerned leaving my pool not working correctly. Thank you so much!!, Sheryl'
],


[
    'name' => 'Todd Gibson',
    'count' => '6 reviews · 2 photos',
    'time' => '5 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocI-bCjYeqoXMVTx1TLCP2eQcsQhFV0x6uiXKsGEnfKxAO2ycnI=w43-h43-p-rp-mo-br100',
    'text' => 'Amazing!!! Anytime I call for anything they answer their phone and take care of my Issues. I would highly recommend them for any pool needs'
],


[
    'name' => 'bop blop',
    'count' => 'Local Guide · 11 reviews · 4 photos',
    'time' => '6 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjVLiySwyIEKuoxSeVAPuNDodGoEvP-02B79h0wbzB4-3W_pesMj=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'Pool Pilots replace our pool heater here in Chandler and it couldn\'t have been easier. I\'m a weekly pool service customer. They handled everything from start to finish with zero stress on our end. Quick, clean, and professional. Danny is the man and was great at walking me through everything. Exactly the kind of service you hope for. Highly recommend!'
],


[
    'name' => 'Alec Semandel',
    'count' => '2 reviews',
    'time' => '3 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjVeFTPuJXpqnJoOFi9ClfAAUz1H0p7HPhQpr-lvkeelgD8lgX9h=w43-h43-p-rp-mo-br100',
    'text' => 'Such great costumer service. Fast responsive and extremely thoughtful. Very lucky to have such a great crew of people.'
],


[
    'name' => 'Brent',
    'count' => 'Local Guide · 15 reviews · 1 photo',
    'time' => '4 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocKztR_wEZpwok4mMZDCmJ7NmlT8XNd_30_907jO0jLl1CWiZw=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'Demetrius is the man for all you pool needs! Easy, simple and treats it like his own. Loves this dude. He\'s been doing my pool for over 10 years.'
],

[
    'name' => 'Francesca Di Biasio',
    'count' => '1 review',
    'time' => '4 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjVUdIT2YAn1eZMn6jraZ_4YzXTT4agTvIC_SR6PMBAxZwbmCDgc=w43-h43-p-rp-mo-br100',
    'text' => 'Was recommended by my Property Manager! Have maintained my pool beautifully while stationed out of state. Quick to respond!'
],

[
    'name' => 'VPS',
    'count' => '1 review',
    'time' => '6 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjVnLnvwFMDSBrlKaYxBKyzZ_nmLqjzslFMkJj-vF8DQqGO_hDP2=w43-h43-p-rp-mo-br100',
    'text' => 'Really happy with Pool Pilots for our pool maintenance here in Mesa. They show up when they say they will, every time. Which is more than I can say for other services I\'ve tried. The team is friendly, professional, and clearly knows what they\'re doing. Pool has never looked better. Highly recommend!'
],


[
    'name' => 'bop blop',
    'count' => 'Local Guide · 11 reviews · 4 photos',
    'time' => '2 months ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjVLiySwyIEKuoxSeVAPuNDodGoEvP-02B79h0wbzB4-3W_pesMj=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'Pool Pilots has been servicing my rental property in Mesa for the last few years and has done an exceptional job. I have the weekly pool cleaning package and my pool looks great. Their team is incredibly responsive!'
],


[
    'name' => 'luna ochoa',
    'count' => '9 reviews',
    'time' => '2 days ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjXfyrcXGY3vjVxGwq_ySxPFMBOu9Q4ZYUWyx5kMYDEpgaYxNtk4=w43-h43-p-rp-mo-br100',
    'text' => 'Definitely recommend! Every interaction has been great with Pool Pilots.'
],


[
    'name' => 'D V',
    'count' => 'Local Guide · 53 reviews · 17 photos',
    'time' => '2 weeks ago',
    'photo' => 'https://lh3.googleusercontent.com/a-/ALV-UjWybvb5cL3CCW60VSKnVPK8V2F8C6ltAe8DQQ55s3IdiBi4Im1Cag=w43-h43-p-rp-mo-ba12-br100',
    'text' => 'Brandon @ Pool Pilots is amazing. I’ve been through several pool companies and none have cared or put the time and effort that Brandon has into our pool. Had an issue and Danny (who’s equally amazing) had Brandon here immediately and fixing it. Highly recommend.'
],


[
    'name' => 'Paul Anderson',
    'count' => '8 reviews',
    'time' => '3 weeks ago',
    'photo' => 'https://lh3.googleusercontent.com/a/ACg8ocLWT5pYiXQ-u29zQ_64qenr-iWyPSo9AdZLpLfgYv23zIt5=w43-h43-p-rp-mo-br100',
    'text' => 'We recently hired Pool Pilots for our pool maintenance and we couldn’t be happier with the service! Danny, the manager, and Brandon, the pool cleaner, are extremely knowledgeable, helpful, and personable. Pool Pilots has earned our highest recommendation.'
],






    ];



    ob_start();
    ?>

    <section class="ppr-section">
        <div class="ppr-trustbar">
            <div class="ppr-google-rating">
                <span class="ppr-google-logo" aria-hidden="true">
                    <svg viewBox="0 0 48 48">
                        <path fill="#4285F4" d="M47.5 24.5c0-1.7-.2-3.4-.5-5H24V29h13.2c-.6 3-2.3 5.6-4.9 7.3v6.1h7.9c4.6-4.2 7.3-10.4 7.3-17.9z"/>
                        <path fill="#34A853" d="M24 48c6.6 0 12.1-2.2 16.2-5.9l-7.9-6.1c-2.2 1.5-5 2.4-8.3 2.4-6.4 0-11.8-4.3-13.7-10.1H2.2v6.3C6.3 42.5 14.4 48 24 48z"/>
                        <path fill="#FBBC05" d="M10.3 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8v-6.3H2.2C.8 15.1 0 19.5 2.2 35.7l8.1-6.3z"/>
                        <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36.1 2.2 30.6 0 24 0 14.4 0 6.3 5.5 2.2 12.4l8.1 6.3C12.2 13.8 17.6 9.5 24 9.5z"/>
                    </svg>
                </span>

                <div>
                    <div class="ppr-rating-line">
                        <strong>5.0</strong>
                        <span>★★★★★</span>
                    </div>
                    <small>Excellent Google rating</small>
                </div>
            </div>

            <span class="ppr-trust-divider"></span>

            <div class="ppr-trust-item">
                <span class="ppr-trust-icon">✓</span>

                <div>
                    <strong>Customer Focused</strong>
                    <small>Reliable local pool professionals</small>
                </div>
            </div>

            <span class="ppr-trust-divider"></span>

            <div class="ppr-trust-item">
                <span class="ppr-trust-icon">★</span>

                <div>
                    <strong>Five-Star Service</strong>
                    <small>Trusted By Scottsdale Homeowners</small>
                </div>
            </div>
        </div>

        <div class="ppr-carousel">

           <button
    class="ppr-arrow ppr-prev"
    type="button"
    aria-label="Previous reviews"
>
    <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path d="M15 18L9 12L15 6"></path>
    </svg>
</button>

            <div class="ppr-viewport">
                <div class="ppr-track">
                    <?php foreach ($reviews as $review) : ?>
                        <?php
                        $reviewer_name = !empty($review['name'])
                            ? $review['name']
                            : 'Google User';

                        $reviewer_initial = strtoupper(
                            function_exists('mb_substr')
                                ? mb_substr($reviewer_name, 0, 1)
                                : substr($reviewer_name, 0, 1)
                        );

                        $reviewer_photo = !empty($review['photo'])
                            ? trim($review['photo'])
                            : '';
                        ?>

                        <article class="ppr-card">
                            <span class="ppr-card-accent"></span>

                            <header class="ppr-card-header">
                                <div class="ppr-avatar">
                                    <?php if ($reviewer_photo !== '') : ?>
                                        <img
                                            src="<?php echo esc_url($reviewer_photo); ?>"
                                            alt="<?php echo esc_attr($reviewer_name); ?>"
                                            loading="lazy"
                                            decoding="async"
                                            referrerpolicy="no-referrer"
                                            onerror="
                                                this.style.display='none';
                                                this.nextElementSibling.style.display='grid';
                                            "
                                        >

                                        <span
                                            class="ppr-avatar-fallback"
                                            aria-hidden="true"
                                            style="display: none;"
                                        >
                                            <?php echo esc_html($reviewer_initial); ?>
                                        </span>
                                    <?php else : ?>
                                        <span
                                            class="ppr-avatar-fallback"
                                            aria-hidden="true"
                                        >
                                            <?php echo esc_html($reviewer_initial); ?>
                                        </span>
                                    <?php endif; ?>
                                </div>

                                <div class="ppr-person">
                                    <strong>
                                        <?php echo esc_html($reviewer_name); ?>
                                    </strong>

                                    <span>
                                        <?php echo esc_html($review['count']); ?>
                                    </span>
                                </div>

                                <span class="ppr-mini-google" aria-hidden="true">
                                    <svg viewBox="0 0 48 48">
                                        <path fill="#4285F4" d="M47.5 24.5c0-1.7-.2-3.4-.5-5H24V29h13.2c-.6 3-2.3 5.6-4.9 7.3v6.1h7.9c4.6-4.2 7.3-10.4 7.3-17.9z"/>
                                        <path fill="#34A853" d="M24 48c6.6 0 12.1-2.2 16.2-5.9l-7.9-6.1c-2.2 1.5-5 2.4-8.3 2.4-6.4 0-11.8-4.3-13.7-10.1H2.2v6.3C6.3 42.5 14.4 48 24 48z"/>
                                        <path fill="#FBBC05" d="M10.3 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8v-6.3H2.2C.8 15.1 0 19.5 2.2 35.7l8.1-6.3z"/>
                                        <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36.1 2.2 30.6 0 24 0 14.4 0 6.3 5.5 2.2 12.4l8.1 6.3C12.2 13.8 17.6 9.5 24 9.5z"/>
                                    </svg>
                                </span>
                            </header>

                            <div class="ppr-review-rating">
                                <span class="ppr-stars">★★★★★</span>

                                <span class="ppr-time">
                                    <?php echo esc_html($review['time']); ?>
                                </span>
                            </div>

                            <div class="ppr-review-text">
                                <?php echo esc_html($review['text']); ?>
                            </div>

                            <?php if (!empty($review['price']) || !empty($review['services'])) : ?>
                                <div class="ppr-meta">
                                    <?php if (!empty($review['price'])) : ?>
                                        <div class="ppr-meta-row">
                                            <span class="ppr-meta-icon">$</span>

                                            <div>
                                                <strong>Price assessment</strong>
                                                <span><?php echo esc_html($review['price']); ?></span>
                                            </div>
                                        </div>
                                    <?php endif; ?>

                                    <?php if (!empty($review['services'])) : ?>
                                        <div class="ppr-meta-row">
                                            <span class="ppr-meta-icon">✓</span>

                                            <div>
                                                <strong>Services</strong>
                                                <span><?php echo esc_html($review['services']); ?></span>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($review['response'])) : ?>
                                <div class="ppr-response">
                                    <div class="ppr-response-title">
                                        <span>PP</span>
                                        <strong>Response from Pool Pilots</strong>
                                    </div>

                                    <p>
                                        <?php echo esc_html($review['response']); ?>
                                    </p>
                                </div>
                            <?php endif; ?>
                        </article>
                    <?php endforeach; ?>
                </div>
            </div>


           <button
    class="ppr-arrow ppr-next"
    type="button"
    aria-label="Next reviews"
>
    <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path d="M9 6L15 12L9 18"></path>
    </svg>
</button>


        </div>

        <div class="ppr-controls">
            <button
                class="ppr-control ppr-control-prev"
                type="button"
                aria-label="Previous review"
            >
                ←
            </button>

            <div class="ppr-dots"></div>

            <button
                class="ppr-control ppr-control-next"
                type="button"
                aria-label="Next review"
            >
                →
            </button>
        </div>

        <a
            class="ppr-google-button"
            href="https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJOSxJg2QLK4cRcuyTG0mpT_o"
            target="_blank"
            rel="noopener noreferrer"
        >
            <span class="ppr-button-google">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#4285F4" d="M47.5 24.5c0-1.7-.2-3.4-.5-5H24V29h13.2c-.6 3-2.3 5.6-4.9 7.3v6.1h7.9c4.6-4.2 7.3-10.4 7.3-17.9z"/>
                    <path fill="#34A853" d="M24 48c6.6 0 12.1-2.2 16.2-5.9l-7.9-6.1c-2.2 1.5-5 2.4-8.3 2.4-6.4 0-11.8-4.3-13.7-10.1H2.2v6.3C6.3 42.5 14.4 48 24 48z"/>
                    <path fill="#FBBC05" d="M10.3 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8v-6.3H2.2C.8 15.1 0 19.5 2.2 35.7l8.1-6.3z"/>
                    <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36.1 2.2 30.6 0 24 0 14.4 0 6.3 5.5 2.2 12.4l8.1 6.3C12.2 13.8 17.6 9.5 24 9.5z"/>
                </svg>
            </span>

            <span>See All Reviews on Google</span>
            <span>↗</span>
        </a>

        <p class="ppr-verification">
            <span>✓</span>
            Real reviews from real Pool Pilots customers
        </p>
    </section>

    <style>
        .ppr-section,
        .ppr-section * {
            box-sizing: border-box;
        }

        .ppr-section {
            --ppr-blue: #1675bd;
            --ppr-blue-dark: #0c5c99;
            --ppr-heading: #10253e;
            --ppr-text: #324258;
            --ppr-muted: #6d7b8d;
            --ppr-border: #e1e8ef;
            --ppr-star: #f7b928;

            width: 100%;
            max-width: 1500px;
            margin: 0 auto;
            padding: 62px 28px 54px;

            background: #ffffff;
            border: 1px solid #edf1f5;
            border-radius: 24px;

            color: var(--ppr-text);

            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Roboto,
                Arial,
                sans-serif;

            box-shadow:
                0 1px 2px rgba(15, 35, 60, 0.02),
                0 18px 55px rgba(15, 35, 60, 0.06);

            overflow: hidden;
        }

        .ppr-trustbar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 28px;

            width: min(940px, 100%);
            margin: 0 auto 44px;
            padding: 20px 26px;

            background: #ffffff;
            border: 1px solid var(--ppr-border);
            border-radius: 16px;

            box-shadow: 0 8px 26px rgba(15, 35, 60, 0.06);
        }

        .ppr-google-rating,
        .ppr-trust-item {
            display: flex;
            align-items: center;
            gap: 13px;
        }

        .ppr-google-logo {
            display: flex;

            width: 47px;
            height: 47px;
            flex: 0 0 47px;
        }

        .ppr-google-logo svg,
        .ppr-mini-google svg,
        .ppr-button-google svg {
            display: block;
            width: 100%;
            height: 100%;
        }

        .ppr-rating-line {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ppr-rating-line strong,
        .ppr-trust-item strong {
            display: block;

            color: var(--ppr-heading);
            font-size: 18px;
            line-height: 1.25;
        }

        .ppr-rating-line span {
            color: var(--ppr-star);
            font-size: 15px;
            letter-spacing: 1px;
        }

        .ppr-google-rating small,
        .ppr-trust-item small {
            display: block;
            margin-top: 3px;

            color: var(--ppr-muted);
            font-size: 12px;
            line-height: 1.4;
        }

        .ppr-trust-icon {
            display: grid;
            place-items: center;

            width: 43px;
            height: 43px;
            flex: 0 0 43px;

            background: #eef7ff;
            border: 1px solid #d8ebfb;
            border-radius: 50%;

            color: var(--ppr-blue);
            font-size: 18px;
            font-weight: 800;
        }

        .ppr-trust-divider {
            width: 1px;
            height: 47px;

            background: #e5ebf1;
        }

        .ppr-carousel {
            position: relative;

            width: 100%;
            padding: 0 60px;
        }

        .ppr-viewport {
            width: 100%;

            border-radius: 18px;
            overflow: hidden;
        }

        .ppr-track {
            display: flex;
            gap: 22px;

            transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
            will-change: transform;
        }

        .ppr-card {
            position: relative;

            display: flex;
            flex: 0 0 calc((100% - 44px) / 3);
            flex-direction: column;

            min-width: 0;
            min-height: 430px;
            padding: 26px;

            background: #ffffff;
            border: 1px solid var(--ppr-border);
            border-radius: 16px;

            box-shadow: 0 8px 24px rgba(15, 35, 60, 0.06);
            overflow: hidden;

            transition:
                transform 0.25s ease,
                border-color 0.25s ease,
                box-shadow 0.25s ease;
        }

        .ppr-card:hover {
            transform: translateY(-4px);

            border-color: #c8d9e8;

            box-shadow: 0 17px 38px rgba(15, 35, 60, 0.1);
        }

        .ppr-card-accent {
            position: absolute;
            top: 0;
            right: 24px;

            width: 38px;
            height: 4px;

            background: var(--ppr-blue);
            border-radius: 0 0 5px 5px;
        }

        .ppr-card-header {
            display: flex;
            align-items: center;
            gap: 13px;
        }

        .ppr-avatar {
            position: relative;

            width: 52px;
            height: 52px;
            flex: 0 0 52px;
            padding: 2px;

            background: #ffffff;
            border: 1px solid #dce5ee;
            border-radius: 50%;

            box-shadow: 0 3px 10px rgba(15, 35, 60, 0.08);
            overflow: hidden;
        }

        .ppr-avatar img {
            display: block;

            width: 100%;
            height: 100%;

            background: #f1f5f9;
            border-radius: 50%;

            object-fit: cover;
            object-position: center;
        }

        .ppr-avatar-fallback {
            display: grid;
            place-items: center;

            width: 100%;
            height: 100%;

            background: linear-gradient(
                145deg,
                #eaf5fd 0%,
                #dceefa 100%
            );

            border-radius: 50%;

            color: #126aa9;
            font-size: 19px;
            font-weight: 700;
            line-height: 1;
            text-transform: uppercase;
        }

        .ppr-person {
            min-width: 0;
            flex: 1;
        }

        .ppr-person strong {
            display: block;

            color: var(--ppr-heading);
            font-size: 16px;
            font-weight: 700;
            line-height: 1.3;

            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .ppr-person span {
            display: block;
            margin-top: 3px;

            color: var(--ppr-muted);
            font-size: 12px;
        }

        .ppr-mini-google {
            display: flex;

            width: 25px;
            height: 25px;
            flex: 0 0 25px;
        }

        .ppr-review-rating {
            display: flex;
            align-items: center;
            gap: 10px;

            margin: 19px 0 14px;
        }

        .ppr-stars {
            color: var(--ppr-star);
            font-size: 17px;
            line-height: 1;
            letter-spacing: 1.5px;
        }

        .ppr-time {
            color: var(--ppr-muted);
            font-size: 12px;
        }

        .ppr-review-text {
            display: -webkit-box;

            color: var(--ppr-text);
            font-size: 15px;
            line-height: 1.65;

            -webkit-box-orient: vertical;
            -webkit-line-clamp: 7;
            overflow: hidden;
        }

        .ppr-meta {
            margin-top: 17px;
            padding-top: 15px;

            border-top: 1px solid #e8edf2;
        }

        .ppr-meta-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;

            margin-bottom: 12px;
        }

        .ppr-meta-row:last-child {
            margin-bottom: 0;
        }

        .ppr-meta-icon {
            display: grid;
            place-items: center;

            width: 18px;
            height: 18px;
            flex: 0 0 18px;

            color: var(--ppr-blue);
            font-size: 12px;
            font-weight: 800;
        }

        .ppr-meta-row strong {
            display: block;
            margin-bottom: 3px;

            color: var(--ppr-heading);
            font-size: 12px;
        }

        .ppr-meta-row span {
            display: block;

            color: var(--ppr-muted);
            font-size: 12px;
            line-height: 1.45;
        }

        .ppr-response {
            margin-top: auto;
            padding: 14px 15px;

            background: #f5f9fd;
            border: 1px solid #e1ebf4;
            border-left: 3px solid var(--ppr-blue);
            border-radius: 9px;
        }

        .ppr-response-title {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ppr-response-title span {
            display: grid;
            place-items: center;

            width: 27px;
            height: 27px;
            flex: 0 0 27px;

            background: var(--ppr-blue);
            border-radius: 50%;

            color: #ffffff;
            font-size: 9px;
            font-weight: 800;
        }

        .ppr-response-title strong {
            color: var(--ppr-heading);
            font-size: 12px;
        }

        .ppr-response p {
            display: -webkit-box;

            margin: 9px 0 0;

            color: #4b5b70;
            font-size: 12px;
            line-height: 1.5;

            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
        }

        .ppr-arrow {
            position: absolute;
            top: 50%;
            z-index: 5;

            display: grid;
            place-items: center;

            width: 48px;
            height: 48px;
            padding: 0;

            background: #ffffff;
            border: 1px solid #dce5ee;
            border-radius: 50%;

            color: var(--ppr-blue);
            font-size: 32px;
            line-height: 1;

            box-shadow: 0 8px 22px rgba(15, 35, 60, 0.1);

            cursor: pointer;
            transform: translateY(-50%);

            transition:
                color 0.2s ease,
                background 0.2s ease,
                transform 0.2s ease;
        }

        .ppr-arrow:hover {
            background: var(--ppr-blue);
            color: #ffffff;

            transform: translateY(-50%) scale(1.05);
        }

        .ppr-prev {
            left: 0;
        }

        .ppr-next {
            right: 0;
        }

        .ppr-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;

            margin: 27px 0 23px;
        }

        .ppr-control {
            width: 30px;
            height: 30px;
            padding: 0;

            background: transparent;
            border: 0;

            color: #718096;
            font-size: 17px;

            cursor: pointer;
        }

        .ppr-control:hover {
            color: var(--ppr-blue);
        }

        .ppr-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;

            max-width: min(520px, 70vw);
            overflow: hidden;
        }

        .ppr-dot {
            width: 7px;
            height: 7px;
            flex: 0 0 7px;
            padding: 0;

            background: #cbd5df;
            border: 0;
            border-radius: 50%;

            cursor: pointer;

            transition:
                width 0.25s ease,
                flex-basis 0.25s ease,
                background 0.25s ease;
        }

        .ppr-dot.active {
            width: 23px;
            flex-basis: 23px;

            background: var(--ppr-blue);
            border-radius: 10px;
        }

        .ppr-google-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 11px;

            width: fit-content;
            min-height: 48px;
            margin: 0 auto;
            padding: 13px 22px;

            background: var(--ppr-blue);
            border: 1px solid var(--ppr-blue);
            border-radius: 9px;

            color: #ffffff !important;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none !important;

            box-shadow: 0 8px 20px rgba(22, 117, 189, 0.2);

            transition:
                background 0.2s ease,
                box-shadow 0.2s ease,
                transform 0.2s ease;
        }

        .ppr-google-button:hover {
            background: var(--ppr-blue-dark);

            box-shadow: 0 12px 26px rgba(22, 117, 189, 0.26);
            transform: translateY(-2px);
        }

        .ppr-button-google {
            display: flex;

            width: 25px;
            height: 25px;
            flex: 0 0 25px;
            padding: 3px;

            background: #ffffff;
            border-radius: 50%;
        }

        .ppr-verification {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;

            margin: 13px 0 0;

            color: var(--ppr-muted);
            font-size: 12px;
            text-align: center;
        }

        .ppr-verification span {
            color: #16a34a;
            font-weight: 800;
        }

        @media (max-width: 1100px) {
            .ppr-card {
                flex-basis: calc((100% - 22px) / 2);
            }
        }

        @media (max-width: 767px) {
            .ppr-section {
                padding: 44px 16px;
                border-radius: 18px;
            }

            .ppr-trustbar {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;

                padding: 18px;
            }

            .ppr-google-rating,
            .ppr-trust-item {
                justify-content: center;
            }

            .ppr-trust-divider {
                width: 100%;
                height: 1px;
            }

            .ppr-carousel {
                padding: 0 31px;
            }

            .ppr-card {
                flex-basis: 100%;
                min-height: 410px;
                padding: 22px;
            }

            .ppr-arrow {
                width: 41px;
                height: 41px;
                font-size: 27px;
            }

            .ppr-avatar {
                width: 48px;
                height: 48px;
                flex-basis: 48px;
            }

            .ppr-google-button {
                width: 100%;
            }
        }

        @media (max-width: 400px) {
            .ppr-section {
                padding-right: 12px;
                padding-left: 12px;
            }

            .ppr-carousel {
                padding-right: 26px;
                padding-left: 26px;
            }

            .ppr-card {
                padding: 19px;
            }

            .ppr-stars {
                font-size: 15px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .ppr-track,
            .ppr-card,
            .ppr-arrow,
            .ppr-google-button {
                transition: none;
            }
        }


       .ppr-carousel {
    position: relative;
    padding-right: 60px;
    padding-left: 60px;
}

.ppr-prev {
    left: 36px;
}

.ppr-next {
    right: 36px;
}

.ppr-arrow {
    top: 50%;
    z-index: 20;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 48px;
    height: 48px;
    padding: 0 0 3px;

    background: #ffffff;
    border: 1px solid #d9e4ee;
    border-radius: 50%;

    color: #1675bd;
    font-family: Arial, sans-serif;
    font-size: 31px;
    font-weight: 400;
    line-height: 1;

    box-shadow:
        0 8px 22px rgba(15, 35, 60, 0.12);

    transform: translateY(-50%);

    cursor: pointer;
}

.ppr-arrow:hover {
    background: #1675bd;
    border-color: #1675bd;
    color: #ffffff;

    transform:
        translateY(-50%)
        scale(1.05);
}

/* Tablet */

@media (max-width: 1100px) {
    .ppr-carousel {
        padding-right: 52px;
        padding-left: 52px;
    }

    .ppr-prev {
        left: 28px;
    }

    .ppr-next {
        right: 28px;
    }
}

/* Mobile */

@media (max-width: 767px) {
    .ppr-carousel {
        padding-right: 30px;
        padding-left: 30px;
    }

    .ppr-arrow {
        width: 40px;
        height: 40px;
        padding-bottom: 2px;

        font-size: 27px;
    }

    .ppr-prev {
        left: 10px;
    }

    .ppr-next {
        right: 10px;
    }
}

/* Small mobile */

@media (max-width: 400px) {
    .ppr-carousel {
        padding-right: 26px;
        padding-left: 26px;
    }

    .ppr-arrow {
        width: 36px;
        height: 36px;

        font-size: 24px;
    }

    .ppr-prev {
        left: 8px;
    }

    .ppr-next {
        right: 8px;
    }
}



/* =========================================================
   COMPACT REVIEW CARD HEIGHT
========================================================= */

.ppr-card {
    height: 350px !important;
    min-height: 350px !important;
    padding: 24px !important;
}

.ppr-review-text {
    -webkit-line-clamp: 6 !important;
    overflow: hidden !important;
}

/* Tablet */
@media (max-width: 1100px) {
    .ppr-card {
        height: 350px !important;
        min-height: 350px !important;
    }
}

/* Mobile */
@media (max-width: 767px) {
    .ppr-card {
        height: 340px !important;
        min-height: 340px !important;
        padding: 20px !important;
    }

    .ppr-review-text {
        -webkit-line-clamp: 6 !important;
    }
}

/* Small Mobile */
@media (max-width: 400px) {
    .ppr-card {
        height: 330px !important;
        min-height: 330px !important;
        padding: 18px !important;
    }

    .ppr-review-text {
        -webkit-line-clamp: 5 !important;
    }
}


/* =========================================================
   REMOVE OUTER WIDGET BORDER / SHADOW
========================================================= */

.ppr-section {
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    background: transparent !important;
}




    </style>

    <script>
        (function () {
            function initializePoolReviews() {
                document
                    .querySelectorAll('.ppr-section')
                    .forEach(function (section) {
                        if (section.dataset.pprReady === 'true') {
                            return;
                        }

                        section.dataset.pprReady = 'true';

                        const viewport =
                            section.querySelector('.ppr-viewport');

                        const track =
                            section.querySelector('.ppr-track');

                        const cards =
                            Array.from(
                                section.querySelectorAll('.ppr-card')
                            );

                        const dotsContainer =
                            section.querySelector('.ppr-dots');

                        const previousButton =
                            section.querySelector('.ppr-prev');

                        const nextButton =
                            section.querySelector('.ppr-next');

                        const controlPrevious =
                            section.querySelector('.ppr-control-prev');

                        const controlNext =
                            section.querySelector('.ppr-control-next');

                        let currentIndex = 0;
                        let autoplayTimer = null;
                        let resizeTimer = null;
                        let touchStartX = 0;

                        function getCardsPerView() {
                            if (window.innerWidth <= 767) {
                                return 1;
                            }

                            if (window.innerWidth <= 1100) {
                                return 2;
                            }

                            return 3;
                        }

                        function getMaximumIndex() {
                            return Math.max(
                                0,
                                cards.length - getCardsPerView()
                            );
                        }

                        function updateCarousel() {
                            if (!cards.length) {
                                return;
                            }

                            const maximumIndex =
                                getMaximumIndex();

                            if (currentIndex > maximumIndex) {
                                currentIndex = maximumIndex;
                            }

                            const cardWidth =
                                cards[0]
                                    .getBoundingClientRect()
                                    .width;

                            const trackStyle =
                                window.getComputedStyle(track);

                            const gap =
                                parseFloat(
                                    trackStyle.columnGap ||
                                    trackStyle.gap ||
                                    22
                                );

                            const offset =
                                (cardWidth + gap) *
                                currentIndex;

                            track.style.transform =
                                'translate3d(-' +
                                offset +
                                'px, 0, 0)';

                            dotsContainer
                                .querySelectorAll('.ppr-dot')
                                .forEach(function (dot, index) {
                                    dot.classList.toggle(
                                        'active',
                                        index === currentIndex
                                    );
                                });
                        }

                        function buildDots() {
                            dotsContainer.innerHTML = '';

                            const totalDots =
                                getMaximumIndex() + 1;

                            for (
                                let index = 0;
                                index < totalDots;
                                index++
                            ) {
                                const dot =
                                    document.createElement('button');

                                dot.type = 'button';
                                dot.className = 'ppr-dot';

                                dot.setAttribute(
                                    'aria-label',
                                    'Go to review ' +
                                    (index + 1)
                                );

                                dot.addEventListener(
                                    'click',
                                    function () {
                                        currentIndex = index;

                                        updateCarousel();
                                        restartAutoplay();
                                    }
                                );

                                dotsContainer.appendChild(dot);
                            }
                        }

                        function showNext() {
                            const maximumIndex =
                                getMaximumIndex();

                            currentIndex =
                                currentIndex >= maximumIndex
                                    ? 0
                                    : currentIndex + 1;

                            updateCarousel();
                        }

                        function showPrevious() {
                            const maximumIndex =
                                getMaximumIndex();

                            currentIndex =
                                currentIndex <= 0
                                    ? maximumIndex
                                    : currentIndex - 1;

                            updateCarousel();
                        }

                        function stopAutoplay() {
                            if (autoplayTimer) {
                                window.clearInterval(
                                    autoplayTimer
                                );

                                autoplayTimer = null;
                            }
                        }

                        function startAutoplay() {
                            stopAutoplay();

                            if (
                                window.matchMedia(
                                    '(prefers-reduced-motion: reduce)'
                                ).matches
                            ) {
                                return;
                            }

                            autoplayTimer =
                                window.setInterval(
                                    showNext,
                                    5500
                                );
                        }

                        function restartAutoplay() {
                            startAutoplay();
                        }

                        previousButton.addEventListener(
                            'click',
                            function () {
                                showPrevious();
                                restartAutoplay();
                            }
                        );

                        nextButton.addEventListener(
                            'click',
                            function () {
                                showNext();
                                restartAutoplay();
                            }
                        );

                        controlPrevious.addEventListener(
                            'click',
                            function () {
                                showPrevious();
                                restartAutoplay();
                            }
                        );

                        controlNext.addEventListener(
                            'click',
                            function () {
                                showNext();
                                restartAutoplay();
                            }
                        );

                        viewport.addEventListener(
                            'mouseenter',
                            stopAutoplay
                        );

                        viewport.addEventListener(
                            'mouseleave',
                            startAutoplay
                        );

                        viewport.addEventListener(
                            'touchstart',
                            function (event) {
                                touchStartX =
                                    event.touches[0].clientX;

                                stopAutoplay();
                            },
                            {
                                passive: true
                            }
                        );

                        viewport.addEventListener(
                            'touchend',
                            function (event) {
                                const touchEndX =
                                    event.changedTouches[0].clientX;

                                const distance =
                                    touchEndX - touchStartX;

                                if (Math.abs(distance) > 45) {
                                    if (distance < 0) {
                                        showNext();
                                    } else {
                                        showPrevious();
                                    }
                                }

                                startAutoplay();
                            },
                            {
                                passive: true
                            }
                        );

                        window.addEventListener(
                            'resize',
                            function () {
                                window.clearTimeout(
                                    resizeTimer
                                );

                                resizeTimer =
                                    window.setTimeout(
                                        function () {
                                            buildDots();
                                            updateCarousel();
                                        },
                                        150
                                    );
                            }
                        );

                        buildDots();
                        updateCarousel();
                        startAutoplay();
                    });
            }

            if (document.readyState === 'loading') {
                document.addEventListener(
                    'DOMContentLoaded',
                    initializePoolReviews
                );
            } else {
                initializePoolReviews();
            }
        })();
    </script>

    <?php

    return ob_get_clean();
});
