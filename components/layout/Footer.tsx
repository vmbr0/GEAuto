import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.06] text-white">
      <div className="container-custom py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4 h-12 overflow-hidden">
              <Image
                src="/logo.png"
                alt="GE Auto Import - Grand Est"
                width={240}
                height={84}
                className="h-10 w-auto object-contain object-center scale-110"
              />
            </Link>
            <p className="text-zinc-300 max-w-md leading-relaxed">
              Votre partenaire de confiance pour l'import de véhicules et de pièces automobiles depuis l'Europe.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-zinc-200 mb-4">Services</h4>
            <ul className="space-y-3 text-zinc-300">
              <li>
                <Link href="/services" className="hover:text-white transition-colors duration-200">
                  Nos services
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-white transition-colors duration-200">
                  Vente de véhicules
                </Link>
              </li>
              <li>
                <Link href="/request/vehicle" className="hover:text-white transition-colors duration-200">
                  Demander un véhicule
                </Link>
              </li>
              <li>
                <Link href="/request/parts" className="hover:text-white transition-colors duration-200">
                  Demander des pièces
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-zinc-200 mb-4">Contact</h4>
            <ul className="space-y-2 text-zinc-300">
              <li>Email: contact@geautoimport.fr</li>
              <li>Téléphone: +33 X XX XX XX XX</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-center text-zinc-400 text-sm">
          <p>&copy; {new Date().getFullYear()} GE Auto Import. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
