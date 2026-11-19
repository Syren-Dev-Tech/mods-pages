import { Link } from 'react-router-dom'
import { ORGANIZATION_DISPLAY_NAME } from '../config/site'

export default function OrganizationHome() {
    return (
        <section className="container">
            {/* Hero Section */}
            <div className="row align-items-center mb-5 pb-4">
                <div className="col-lg-8">
                    <div className="mb-4">
                        <h1 className="display-4 fw-bold mb-3">{ORGANIZATION_DISPLAY_NAME}</h1>
                        <p className="lead mb-3">
                            Just some Minecraft mods and dev tools we've been tinkering with.
                        </p>
                        <p className="text-body-secondary mb-4">
                            All open source and free to use. We build these because we're passionate about Minecraft
                            and love making cool stuff. Feel free to explore, report bugs, and suggest features!
                        </p>
                    </div>

                    <div className="d-flex gap-3 flex-wrap">
                        <Link className="btn btn-primary btn-lg" to="/mods">
                            <i className="bi bi-box me-2" aria-hidden="true" />
                            Check Out Mods
                        </Link>
                        <a
                            className="btn btn-outline-primary btn-lg"
                            href="https://github.com/syren-dev-tech"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-github me-2" aria-hidden="true" />
                            Find Us on GitHub
                        </a>
                    </div>
                </div>

                <div className="col-lg-4 text-center mt-4 mt-lg-0">
                    <div className="display-1 mb-3">⛏️</div>
                    <p className="text-body-secondary">Built with love by a small team</p>
                </div>
            </div>

            <hr className="my-5" />

            {/* Features Section */}
            <div className="row mb-5">
                <div className="col-12">
                    <h2 className="h3 fw-bold mb-4">What You'll Find Here</h2>
                </div>

                <div className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 muted-panel border-0 p-4">
                        <div className="h3 mb-3 text-mods-accent">
                            <i className="bi bi-box-fill" aria-hidden="true" />
                        </div>
                        <h3 className="h5 fw-bold mb-2">Useful Mods</h3>
                        <p className="text-body-secondary mb-0">
                            Mods that add cool features or quality of life improvements to Minecraft. We focus on
                            keeping them lightweight and performant.
                        </p>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 muted-panel border-0 p-4">
                        <div className="h3 mb-3 text-mods-accent">
                            <i className="bi bi-collection-fill" aria-hidden="true" />
                        </div>
                        <h3 className="h5 fw-bold mb-2">Dev Libraries</h3>
                        <p className="text-body-secondary mb-0">
                            Helper libraries we've built to make our own development easier. We're sharing them because
                            they might be useful for you too!
                        </p>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 muted-panel border-0 p-4">
                        <div className="h3 mb-3 text-mods-accent">
                            <i className="bi bi-github" aria-hidden="true" />
                        </div>
                        <h3 className="h5 fw-bold mb-2">Completely Open</h3>
                        <p className="text-body-secondary mb-0">
                            Everything's on GitHub and totally free. Want to report a bug or suggest something? We'd
                            love to hear from you!
                        </p>
                    </div>
                </div>
            </div>

            <hr className="my-5" />

            {/* CTA Section */}
            <div className="row mb-5">
                <div className="col-lg-8 mx-auto text-center">
                    <div className="muted-panel border-0 p-5 rounded-3">
                        <h2 className="h3 fw-bold mb-3">Want to check us out?</h2>
                        <p className="text-body-secondary mb-4">
                            Browse our mods and libraries below. Each one has docs and installation instructions to
                            get you up and running fast.
                        </p>
                        <Link className="btn btn-primary btn-lg" to="/mods">
                            <i className="bi bi-box me-2" aria-hidden="true" />
                            See What We've Built
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
